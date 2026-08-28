# NiaKylie – Category & Sub-Category API Integration Reference

> **Purpose**: Master integration specification for 2-Level **Category & Sub-Category Management APIs** (Public & Store Frontend & Admin). Any AI or frontend developer can use this guide to implement store header dropdowns, PLP category sidebar filters, and Admin Category/Sub-Category Management Panels with 100% contract compliance.  
> **Base URL**: `http://localhost:3000/api/v1` (Dev) | `https://api.niakylie.com/api/v1` (Prod)  
> **Auth Requirements**:
> - `GET /categories` & `GET /categories/:idOrSlug`: Public (No token required)
> - `POST /categories`, `PUT /categories/:id`, `DELETE /categories/:id`: Requires JWT Bearer Token (`Authorization: Bearer <accessToken>`) with `roles: ["ADMIN"]` or `"admin"`.

---

## 1. Hierarchy Model: Category vs. Sub-Category

NiaKylie uses a clean, 2-Level Category Model:

- **LEVEL 1: CATEGORY (Top-Level Parent)**
  - `parentId = null`
  - Examples: *"Women Ethnic Wear"*, *"Men Fusion Wear"*, *"Footwear"*

- **LEVEL 2: SUB-CATEGORY (Child Category)**
  - `parentId = <Category_ID>`
  - Examples: *"Sarees"*, *"Kurtas"*, *"Lehengas"*, *"Sherwanis"*

---

## 2. Quick Reference: Category Routes Table

| Method | Endpoint | Description | Content-Type | Auth Required |
|---|---|---|---|---|
| `GET` | `/categories` | List active categories (supports filtering by `parentId`, search, sort & pagination up to `limit=500`) | — | Public |
| `GET` | `/categories/:idOrSlug` | Fetch single category/sub-category details by Mongo ID or URL Slug | — | Public |
| `POST` | `/categories` | Create new Category or Sub-Category with optional image/banner upload | `multipart/form-data` | ✅ JWT + ADMIN |
| `PUT` | `/categories/:id` | Update Category or Sub-Category details & replace images | `multipart/form-data` | ✅ JWT + ADMIN |
| `DELETE` | `/categories/:id` | Soft-delete Category and automatically soft-delete its Sub-Categories | — | ✅ JWT + ADMIN |

---

## 3. TypeScript Interfaces (`src/types/category.ts`)

```ts
// ── Category Ancestor Item (Breadcrumb) ────────────────────
export interface CategoryAncestor {
  _id: string;
  name: string;
  slug: string;
}

// ── Master Category / Sub-Category Interface ────────────────
export interface Category {
  _id: string;
  name: string;
  slug: string;
  parentId: string | null;   // null = Level 1 Category; Mongo ID = Level 2 Sub-Category
  ancestors: CategoryAncestor[];
  description?: string;
  image?: string;            // Thumbnail image path, e.g. "/uploads/categories/image-1724650000.webp"
  banner?: string;           // Header banner image path, e.g. "/uploads/categories/banner-1724650000.webp"
  status: boolean;           // true = active, false = disabled
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords: string[];
  isDeleted: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Category with Nested Sub-Categories ───────────────────
export interface CategoryWithSubCategories extends Category {
  subCategories: Category[];
}

// ── Query Parameters for GET /categories ──────────────────
export interface QueryCategoryParams {
  page?: number;             // Default: 1
  limit?: number;            // Default: 10 (Max: 500)
  search?: string;           // Search keyword (matches name, slug, description)
  parentId?: string | 'null'; // Pass 'null' for Level 1 Categories; Pass Category ID for Level 2 Sub-Categories
  status?: boolean;          // Filter active/inactive status
  sort?: string;             // Sort field (e.g., "-createdAt", "name")
}

// ── Paginated Response Wrapper ──────────────────────────────
export interface PaginatedCategoriesResponse {
  data: Category[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ── Create Category / Sub-Category Payload ────────────────
export interface CreateCategoryInput {
  name: string;
  parentId?: string | null;  // Leave empty/null for Category; Set Category ID for Sub-Category
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  image?: File;
  banner?: File;
}

// ── Update Category Input ──────────────────────────────────
export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {
  status?: boolean;
}
```

---

## 4. How to Work with Category & Sub-Category in Code

### A. Identification Rules
1. **Category (Level 1 Parent)**: `cat.parentId === null`
2. **Sub-Category (Level 2 Child)**: `cat.parentId !== null`

---

### B. Filtering Categories vs. Sub-Categories via API

| Goal | Endpoint Query | What it Returns |
|---|---|---|
| **Fetch ONLY Level 1 Categories** | `GET /api/v1/categories?parentId=null&limit=500` | Returns all main top-level Categories |
| **Fetch Sub-Categories for a Specific Category** | `GET /api/v1/categories?parentId=<category_id>&limit=500` | Returns all Sub-Categories belonging to that Category |
| **Fetch All Items to map Category + Sub-Categories** | `GET /api/v1/categories?limit=500` | Returns all Categories and Sub-Categories in 1 flat list |

---

### C. TypeScript Utility Helpers (`src/utils/categoryHelpers.ts`)

```ts
import { Category, CategoryWithSubCategories } from '../types/category';

/**
 * Check if item is a Level 1 Main Category
 */
export const isCategory = (item: Category): boolean => {
  return item.parentId === null || item.parentId === 'null' || !item.parentId;
};

/**
 * Check if item is a Level 2 Sub-Category
 */
export const isSubCategory = (item: Category): boolean => {
  return item.parentId !== null && item.parentId !== 'null' && item.parentId !== undefined;
};

/**
 * Group flat category list into main Categories with nested subCategories array
 */
export const groupCategoriesAndSubCategories = (
  flatList: Category[],
): CategoryWithSubCategories[] => {
  const categories = flatList.filter(isCategory);
  const subCategories = flatList.filter(isSubCategory);

  return categories.map((cat) => {
    const catId = cat._id || (cat as any).id;
    return {
      ...cat,
      subCategories: subCategories.filter((sub) => {
        const pId = typeof sub.parentId === 'object' && sub.parentId ? ((sub.parentId as any)._id || (sub.parentId as any).id) : sub.parentId;
        return pId === catId;
      }),
    };
  });
};
```

---

## 5. Detailed Endpoint Contracts

### 5.1 Fetch Categories & Sub-Categories List (`GET /categories`)
- **Description**: Returns active categories and sub-categories. Pass `parentId=null` to get Level 1 Main Categories, or pass `parentId=<category_id>` to get its Sub-Categories.
- **Auth Required**: Public

#### Request Example 1: Fetch Main Categories (`Level 1`)
`GET http://localhost:3000/api/v1/categories?parentId=null&limit=500`

#### Success Response (`HTTP 200 OK`)
```json
{
  "data": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c001",
      "name": "Women Ethnic Wear",
      "slug": "women-ethnic-wear",
      "parentId": null,
      "ancestors": [],
      "description": "Main women ethnic wear collection",
      "image": "/uploads/categories/image-1724650000.webp",
      "status": true,
      "isDeleted": false,
      "createdAt": "2026-08-26T10:00:00.000Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 500,
    "totalPages": 1
  }
}
```

---

### 5.2 Create Category or Sub-Category (`POST /categories`)
- **Description**: Creates a new Main Category (`parentId = null`) or Sub-Category (`parentId = Category_ID`).
- **Auth Required**: ✅ JWT Bearer Token (`roles: ["ADMIN"]`)
- **Content-Type**: `multipart/form-data`

---

### 5.3 Soft Delete Category or Sub-Category (`DELETE /categories/:id`)
- **Description**: Soft-deletes target category and recursively soft-deletes all its sub-categories. Automatically invalidates server-side Redis cache.
- **Auth Required**: ✅ JWT Bearer Token (`roles: ["ADMIN"]`)
- **Success Response**: `HTTP 204 No Content`

#### Example Frontend Delete Code:
```ts
const handleDelete = async (id: string) => {
  if (!confirm('Delete this category?')) return;
  await categoriesApi.deleteCategory(id);
  
  // Invalidate all React Query category caches
  queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
  queryClient.invalidateQueries({ queryKey: ['megamenu-categories'] });
  queryClient.invalidateQueries({ queryKey: ['filter-categories-list'] });
};
```

---

## 6. Frontend Integration & Display Troubleshooting

### Solutions for Complete Listing & Deletion:
1. **Pagination Limit**: Request `limit=500` (`getCategories({ limit: 500 })`) so that all database categories load in one query without default 10-item pagination truncation.
2. **Server Compilation**: After editing NestJS controllers/services, ensure `nest build` is executed so that compiled JS in `dist/` is refreshed.
3. **Cache Invalidation on Mutation**: When calling `POST`, `PUT`, or `DELETE` endpoints, trigger backend Redis cache reset and invalidate React Query keys (`admin-categories`, `megamenu-categories`, `filter-categories-list`) to instantly update the UI.
