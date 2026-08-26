"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const product_schema_js_1 = require("../schemas/product.schema.js");
let ProductsRepository = class ProductsRepository {
    productModel;
    constructor(productModel) {
        this.productModel = productModel;
    }
    async create(data) {
        const product = new this.productModel(data);
        return product.save();
    }
    async findById(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id))
            return null;
        return this.productModel
            .findOne({ _id: new mongoose_2.Types.ObjectId(id), isDeleted: false })
            .populate('categoryId', 'name slug')
            .populate('brandId', 'name slug logo')
            .exec();
    }
    async findBySlug(slug) {
        return this.productModel
            .findOne({ slug, isDeleted: false })
            .populate('categoryId', 'name slug')
            .populate('brandId', 'name slug logo')
            .exec();
    }
    async findAll(queryDto) {
        let { page = 1, limit = 12, search, categoryId, category, brandId, minPrice, maxPrice, colors, sizes, material, pattern, season, productCollection: collection, isFeatured, isTrending, isBestSeller, status, sortBy = 'createdAt', sortOrder = 'desc', sort, } = queryDto;
        if (sort) {
            if (sort === 'recommended' || sort === 'newest') {
                sortBy = 'createdAt';
                sortOrder = 'desc';
            }
            else if (sort === 'price-low' || sort === 'price_asc') {
                sortBy = 'price';
                sortOrder = 'asc';
            }
            else if (sort === 'price-high' || sort === 'price_desc') {
                sortBy = 'price';
                sortOrder = 'desc';
            }
            else if (sort === 'rating') {
                sortBy = 'averageRating';
                sortOrder = 'desc';
            }
        }
        const effectiveCatId = categoryId || (category && mongoose_2.Types.ObjectId.isValid(category) ? category : undefined);
        const categorySlug = category && !mongoose_2.Types.ObjectId.isValid(category) ? category.toLowerCase().trim() : undefined;
        const skip = (page - 1) * limit;
        const baseMatch = { isDeleted: false };
        if (status !== undefined)
            baseMatch.status = status;
        if (effectiveCatId && mongoose_2.Types.ObjectId.isValid(effectiveCatId))
            baseMatch.categoryId = new mongoose_2.Types.ObjectId(effectiveCatId);
        if (brandId && mongoose_2.Types.ObjectId.isValid(brandId))
            baseMatch.brandId = new mongoose_2.Types.ObjectId(brandId);
        if (material)
            baseMatch.material = { $regex: material, $options: 'i' };
        if (pattern)
            baseMatch.pattern = { $regex: pattern, $options: 'i' };
        if (season)
            baseMatch.season = { $regex: season, $options: 'i' };
        if (collection)
            baseMatch.productCollection = { $regex: collection, $options: 'i' };
        if (isFeatured !== undefined)
            baseMatch.isFeatured = isFeatured;
        if (isTrending !== undefined)
            baseMatch.isTrending = isTrending;
        if (isBestSeller !== undefined)
            baseMatch.isBestSeller = isBestSeller;
        if (search)
            baseMatch.$text = { $search: search };
        const variantMatch = { 'variants.isActive': true };
        if (minPrice !== undefined)
            variantMatch['variants.offerPrice'] = { ...(variantMatch['variants.offerPrice'] || {}), $gte: minPrice };
        if (maxPrice !== undefined)
            variantMatch['variants.offerPrice'] = { ...(variantMatch['variants.offerPrice'] || {}), $lte: maxPrice };
        if (colors) {
            const colorArr = colors.split(',').map((c) => c.trim());
            variantMatch['variants.color'] = { $in: colorArr };
        }
        if (sizes) {
            const sizeArr = sizes.split(',').map((s) => s.trim());
            variantMatch['variants.size'] = { $in: sizeArr };
        }
        const hasVariantFilter = Object.keys(variantMatch).length > 1 || minPrice !== undefined || maxPrice !== undefined;
        const sortMap = {
            price: 'minOfferPrice',
            name: 'name',
            averageRating: 'averageRating',
            reviewsCount: 'reviewsCount',
            createdAt: 'createdAt',
        };
        const sortField = sortMap[sortBy] ?? 'createdAt';
        const sortDir = sortOrder === 'asc' ? 1 : -1;
        const pipeline = [
            { $match: baseMatch },
            ...(hasVariantFilter
                ? [
                    { $unwind: '$variants' },
                    { $match: variantMatch },
                    {
                        $group: {
                            _id: '$_id',
                            root: { $first: '$$ROOT' },
                            variants: { $push: '$variants' },
                            minOfferPrice: { $min: '$variants.offerPrice' },
                        },
                    },
                    {
                        $replaceRoot: {
                            newRoot: {
                                $mergeObjects: ['$root', { variants: '$variants', minOfferPrice: '$minOfferPrice' }],
                            },
                        },
                    },
                ]
                : [
                    {
                        $addFields: {
                            minOfferPrice: { $min: '$variants.offerPrice' },
                        },
                    },
                ]),
            {
                $facet: {
                    data: [
                        { $sort: { [sortField]: sortDir } },
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $lookup: {
                                from: 'categories',
                                localField: 'categoryId',
                                foreignField: '_id',
                                pipeline: [{ $project: { name: 1, slug: 1 } }],
                                as: 'category',
                            },
                        },
                        { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
                        {
                            $lookup: {
                                from: 'brands',
                                localField: 'brandId',
                                foreignField: '_id',
                                pipeline: [{ $project: { name: 1, slug: 1, logo: 1 } }],
                                as: 'brand',
                            },
                        },
                        { $unwind: { path: '$brand', preserveNullAndEmptyArrays: true } },
                    ],
                    total: [{ $count: 'count' }],
                },
            },
        ];
        const [result] = await this.productModel.aggregate(pipeline).exec();
        const data = result?.data ?? [];
        const total = result?.total?.[0]?.count ?? 0;
        return { data, total, page, limit };
    }
    async update(id, updateData) {
        if (!mongoose_2.Types.ObjectId.isValid(id))
            return null;
        return this.productModel
            .findOneAndUpdate({ _id: new mongoose_2.Types.ObjectId(id), isDeleted: false }, updateData, { new: true })
            .exec();
    }
    async softDelete(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id))
            return null;
        return this.productModel
            .findOneAndUpdate({ _id: new mongoose_2.Types.ObjectId(id), isDeleted: false }, { $set: { isDeleted: true, deletedAt: new Date() } }, { new: true })
            .exec();
    }
    async addImages(id, urls) {
        if (!mongoose_2.Types.ObjectId.isValid(id))
            return null;
        return this.productModel
            .findOneAndUpdate({ _id: new mongoose_2.Types.ObjectId(id), isDeleted: false }, { $push: { images: { $each: urls } } }, { new: true })
            .exec();
    }
    async addVariant(id, variant) {
        if (!mongoose_2.Types.ObjectId.isValid(id))
            return null;
        return this.productModel
            .findOneAndUpdate({ _id: new mongoose_2.Types.ObjectId(id), isDeleted: false }, { $push: { variants: variant } }, { new: true })
            .exec();
    }
    async updateVariant(productId, variantId, updateData) {
        if (!mongoose_2.Types.ObjectId.isValid(productId) || !mongoose_2.Types.ObjectId.isValid(variantId))
            return null;
        const setFields = {};
        Object.entries(updateData).forEach(([k, v]) => {
            setFields[`variants.$.${k}`] = v;
        });
        return this.productModel
            .findOneAndUpdate({
            _id: new mongoose_2.Types.ObjectId(productId),
            isDeleted: false,
            'variants._id': new mongoose_2.Types.ObjectId(variantId),
        }, { $set: setFields }, { new: true })
            .exec();
    }
    async deleteVariant(productId, variantId) {
        if (!mongoose_2.Types.ObjectId.isValid(productId) || !mongoose_2.Types.ObjectId.isValid(variantId))
            return null;
        return this.productModel
            .findOneAndUpdate({ _id: new mongoose_2.Types.ObjectId(productId), isDeleted: false }, { $pull: { variants: { _id: new mongoose_2.Types.ObjectId(variantId) } } }, { new: true })
            .exec();
    }
};
exports.ProductsRepository = ProductsRepository;
exports.ProductsRepository = ProductsRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(product_schema_js_1.Product.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ProductsRepository);
//# sourceMappingURL=products.repository.js.map