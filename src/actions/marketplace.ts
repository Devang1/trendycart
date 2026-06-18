"use server";

import { revalidatePath } from "next/cache";
import { OrderStatus, PaymentStatus, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole, requireUser } from "@/lib/session";
import { slugify } from "@/lib/utils";
import { productSchema } from "@/lib/validations";

export async function createSellerStore(formData: FormData) {
  const user = await requireUser();
  const storeName = String(formData.get("storeName"));
  const description = String(formData.get("description") ?? "");

  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { role: "SELLER" } }),
    prisma.seller.upsert({
      where: { userId: user.id },
      update: { storeName, description },
      create: { userId: user.id, storeName, description, slug: `${slugify(storeName)}-${Date.now()}` }
    })
  ]);

  revalidatePath("/seller");
}

export async function createProduct(formData: FormData) {
  const user = await requireRole(["SELLER", "ADMIN"]);
  const seller = await prisma.seller.findUniqueOrThrow({ where: { userId: user.id } });
  const categoryIds = getCategoryIds(formData);
  const parsed = productSchema.parse({
    name: formData.get("name"),
    description: formData.get("description"),
    categoryIds,
    brand: formData.get("brand"),
    price: formData.get("price"),
    discountPrice: formData.get("discountPrice") || undefined,
    stock: formData.get("stock"),
    images: String(formData.get("images")).split(",").map((item) => item.trim())
  });
  const { categoryIds: parsedCategoryIds, ...productData } = parsed;

  await prisma.product.create({
    data: {
      ...productData,
      sellerId: seller.id,
      categoryId: parsedCategoryIds[0],
      categories: { connect: parsedCategoryIds.map((id) => ({ id })) },
      slug: `${slugify(productData.name)}-${Date.now()}`,
      sku: `TC-${Date.now()}`,
      tags: [],
      approved: user.role === "ADMIN"
    }
  });

  revalidatePath("/seller");
  revalidatePath("/shop");
}

export async function approveSeller(sellerId: string) {
  await requireRole(["ADMIN"]);
  await prisma.seller.update({
    where: { id: sellerId },
    data: { approvalStatus: "APPROVED", verifiedAt: new Date(), user: { update: { role: "SELLER" } } }
  });
  revalidatePath("/admin");
}

export async function approveProduct(productId: string) {
  await requireRole(["ADMIN"]);
  await prisma.product.update({ where: { id: productId }, data: { approved: true } });
  revalidatePath("/admin");
  revalidatePath("/shop");
}

export async function createAdminProduct(formData: FormData) {
  await requireRole(["ADMIN"]);
  const sellerId = String(formData.get("sellerId"));
  const featured = formData.get("featured") === "on";
  const approved = formData.get("approved") === "on";
  const categoryIds = getCategoryIds(formData);
  const parsed = productSchema.parse({
    name: formData.get("name"),
    description: formData.get("description"),
    categoryIds,
    brand: formData.get("brand"),
    price: formData.get("price"),
    discountPrice: formData.get("discountPrice") || undefined,
    stock: formData.get("stock"),
    images: String(formData.get("images")).split(",").map((item) => item.trim()).filter(Boolean)
  });
  const { categoryIds: parsedCategoryIds, ...productData } = parsed;

  await prisma.product.create({
    data: {
      ...productData,
      sellerId,
      categoryId: parsedCategoryIds[0],
      categories: { connect: parsedCategoryIds.map((id) => ({ id })) },
      featured,
      approved,
      slug: `${slugify(productData.name)}-${Date.now()}`,
      sku: `TC-${Date.now()}`,
      tags: []
    }
  });

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/shop");
}

export async function updateAdminProduct(formData: FormData) {
  await requireRole(["ADMIN"]);
  const productId = String(formData.get("productId"));
  const price = Number(formData.get("price"));
  const discountValue = String(formData.get("discountPrice") ?? "").trim();
  const stock = Number(formData.get("stock"));
  const categoryIds = getCategoryIds(formData);

  await prisma.product.update({
    where: { id: productId },
    data: {
      ...(categoryIds.length
        ? {
            categoryId: categoryIds[0],
            categories: { set: categoryIds.map((id) => ({ id })) }
          }
        : {}),
      price,
      discountPrice: discountValue ? Number(discountValue) : null,
      stock,
      approved: formData.get("approved") === "on",
      featured: formData.get("featured") === "on"
    }
  });

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/shop");
}

export async function deleteAdminProduct(formData: FormData) {
  await requireRole(["ADMIN"]);
  const productId = String(formData.get("productId"));
  await prisma.product.delete({ where: { id: productId } });
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/shop");
}

export async function createAdminCategory(formData: FormData) {
  await requireRole(["ADMIN"]);
  const name = String(formData.get("name"));
  const image = String(formData.get("image") ?? "").trim();

  await prisma.category.create({
    data: {
      name,
      slug: `${slugify(name)}-${Date.now()}`,
      image: image || null
    }
  });

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/categories");
}

export async function updateAdminOrder(formData: FormData) {
  await requireRole(["ADMIN"]);
  const orderId = String(formData.get("orderId"));
  const orderStatus = String(formData.get("orderStatus")) as OrderStatus;
  const paymentStatus = String(formData.get("paymentStatus")) as PaymentStatus;
  const trackingNumber = String(formData.get("trackingNumber") ?? "").trim();
  const expectedDeliveryDateValue = String(formData.get("expectedDeliveryDate") ?? "").trim();
  const deliveryRemark = String(formData.get("deliveryRemark") ?? "").trim();

  await prisma.order.update({
    where: { id: orderId },
    data: {
      orderStatus,
      paymentStatus,
      trackingNumber: trackingNumber || null,
      expectedDeliveryDate: expectedDeliveryDateValue ? new Date(`${expectedDeliveryDateValue}T00:00:00`) : null,
      deliveryRemark: deliveryRemark || null,
      statusTimeline: {
        create: {
          status: orderStatus,
          note: deliveryRemark || (trackingNumber ? `Tracking: ${trackingNumber}` : "Status updated by admin")
        }
      }
    }
  });

  revalidatePath("/admin");
  revalidatePath("/orders");
}

export async function updateAdminUserRole(formData: FormData) {
  await requireRole(["ADMIN"]);
  const userId = String(formData.get("userId"));
  const role = String(formData.get("role")) as Role;

  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/admin");
}

export async function createAdminCoupon(formData: FormData) {
  await requireRole(["ADMIN"]);
  const code = String(formData.get("code")).trim().toUpperCase();
  const discount = Number(formData.get("discount"));
  const minAmountValue = String(formData.get("minAmount") ?? "").trim();
  const expiryDate = new Date(String(formData.get("expiryDate")));

  await prisma.coupon.create({
    data: {
      code,
      discount,
      isPercentage: formData.get("isPercentage") === "on",
      minAmount: minAmountValue ? Number(minAmountValue) : null,
      expiryDate,
      usageLimit: Number(formData.get("usageLimit") || 0) || null,
      active: true
    }
  });

  revalidatePath("/admin");
}

export async function toggleAdminCoupon(formData: FormData) {
  await requireRole(["ADMIN"]);
  const couponId = String(formData.get("couponId"));
  const active = formData.get("active") === "on";

  await prisma.coupon.update({ where: { id: couponId }, data: { active } });
  revalidatePath("/admin");
}

function getCategoryIds(formData: FormData) {
  const ids = formData
    .getAll("categoryIds")
    .map((value) => String(value).trim())
    .filter(Boolean);
  const fallback = String(formData.get("categoryId") ?? "").trim();
  return Array.from(new Set(ids.length ? ids : fallback ? [fallback] : []));
}
