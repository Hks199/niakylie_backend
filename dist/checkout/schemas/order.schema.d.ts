import { Document, Schema as MongooseSchema, Types } from 'mongoose';
export type OrderDocument = Order & Document;
export declare enum PaymentMethod {
    COD = "COD",
    RAZORPAY = "RAZORPAY",
    STRIPE = "STRIPE"
}
export declare enum PaymentStatus {
    PENDING = "PENDING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    REFUNDED = "REFUNDED"
}
export declare enum ShippingMethod {
    STANDARD = "STANDARD",
    EXPRESS = "EXPRESS"
}
export declare enum OrderStatus {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    PACKED = "PACKED",
    SHIPPED = "SHIPPED",
    OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY",
    DELIVERED = "DELIVERED",
    CANCELLED = "CANCELLED",
    RETURNED = "RETURNED",
    REFUNDED = "REFUNDED"
}
export declare class OrderAddress {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
}
export declare const OrderAddressSchema: MongooseSchema<OrderAddress, import("mongoose").Model<OrderAddress, any, any, any, any, any, OrderAddress>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, OrderAddress, Document<unknown, {}, OrderAddress, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<OrderAddress & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    street?: import("mongoose").SchemaDefinitionProperty<string, OrderAddress, Document<unknown, {}, OrderAddress, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<OrderAddress & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    city?: import("mongoose").SchemaDefinitionProperty<string, OrderAddress, Document<unknown, {}, OrderAddress, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<OrderAddress & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    state?: import("mongoose").SchemaDefinitionProperty<string, OrderAddress, Document<unknown, {}, OrderAddress, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<OrderAddress & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    postalCode?: import("mongoose").SchemaDefinitionProperty<string, OrderAddress, Document<unknown, {}, OrderAddress, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<OrderAddress & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    country?: import("mongoose").SchemaDefinitionProperty<string, OrderAddress, Document<unknown, {}, OrderAddress, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<OrderAddress & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    phone?: import("mongoose").SchemaDefinitionProperty<string, OrderAddress, Document<unknown, {}, OrderAddress, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<OrderAddress & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, OrderAddress>;
export declare class OrderItem {
    productId: Types.ObjectId;
    variantId: Types.ObjectId;
    sku: string;
    name: string;
    quantity: number;
    unitPrice: number;
    unitMrp: number;
    color?: string;
    size?: string;
    image?: string;
    totalPrice: number;
}
export declare const OrderItemSchema: MongooseSchema<OrderItem, import("mongoose").Model<OrderItem, any, any, any, any, any, OrderItem>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, OrderItem, Document<unknown, {}, OrderItem, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<OrderItem & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    productId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, OrderItem, Document<unknown, {}, OrderItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<OrderItem & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    variantId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, OrderItem, Document<unknown, {}, OrderItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<OrderItem & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    sku?: import("mongoose").SchemaDefinitionProperty<string, OrderItem, Document<unknown, {}, OrderItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<OrderItem & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    name?: import("mongoose").SchemaDefinitionProperty<string, OrderItem, Document<unknown, {}, OrderItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<OrderItem & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    quantity?: import("mongoose").SchemaDefinitionProperty<number, OrderItem, Document<unknown, {}, OrderItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<OrderItem & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    unitPrice?: import("mongoose").SchemaDefinitionProperty<number, OrderItem, Document<unknown, {}, OrderItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<OrderItem & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    unitMrp?: import("mongoose").SchemaDefinitionProperty<number, OrderItem, Document<unknown, {}, OrderItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<OrderItem & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    color?: import("mongoose").SchemaDefinitionProperty<string | undefined, OrderItem, Document<unknown, {}, OrderItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<OrderItem & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    size?: import("mongoose").SchemaDefinitionProperty<string | undefined, OrderItem, Document<unknown, {}, OrderItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<OrderItem & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    image?: import("mongoose").SchemaDefinitionProperty<string | undefined, OrderItem, Document<unknown, {}, OrderItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<OrderItem & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    totalPrice?: import("mongoose").SchemaDefinitionProperty<number, OrderItem, Document<unknown, {}, OrderItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<OrderItem & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, OrderItem>;
export declare class PaymentInfo {
    method: PaymentMethod;
    status: PaymentStatus;
    transactionId?: string;
    paidAt?: Date;
}
export declare const PaymentInfoSchema: MongooseSchema<PaymentInfo, import("mongoose").Model<PaymentInfo, any, any, any, any, any, PaymentInfo>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, PaymentInfo, Document<unknown, {}, PaymentInfo, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<PaymentInfo & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    method?: import("mongoose").SchemaDefinitionProperty<PaymentMethod, PaymentInfo, Document<unknown, {}, PaymentInfo, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PaymentInfo & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<PaymentStatus, PaymentInfo, Document<unknown, {}, PaymentInfo, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PaymentInfo & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    transactionId?: import("mongoose").SchemaDefinitionProperty<string | undefined, PaymentInfo, Document<unknown, {}, PaymentInfo, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PaymentInfo & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    paidAt?: import("mongoose").SchemaDefinitionProperty<Date | undefined, PaymentInfo, Document<unknown, {}, PaymentInfo, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PaymentInfo & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, PaymentInfo>;
export declare class ShippingInfo {
    method: ShippingMethod;
    fee: number;
    trackingNumber?: string;
    courierPartner?: string;
    estimatedDelivery?: Date;
    shippedAt?: Date;
    deliveredAt?: Date;
}
export declare const ShippingInfoSchema: MongooseSchema<ShippingInfo, import("mongoose").Model<ShippingInfo, any, any, any, any, any, ShippingInfo>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ShippingInfo, Document<unknown, {}, ShippingInfo, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<ShippingInfo & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    method?: import("mongoose").SchemaDefinitionProperty<ShippingMethod, ShippingInfo, Document<unknown, {}, ShippingInfo, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ShippingInfo & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    fee?: import("mongoose").SchemaDefinitionProperty<number, ShippingInfo, Document<unknown, {}, ShippingInfo, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ShippingInfo & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    trackingNumber?: import("mongoose").SchemaDefinitionProperty<string | undefined, ShippingInfo, Document<unknown, {}, ShippingInfo, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ShippingInfo & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    courierPartner?: import("mongoose").SchemaDefinitionProperty<string | undefined, ShippingInfo, Document<unknown, {}, ShippingInfo, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ShippingInfo & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    estimatedDelivery?: import("mongoose").SchemaDefinitionProperty<Date | undefined, ShippingInfo, Document<unknown, {}, ShippingInfo, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ShippingInfo & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    shippedAt?: import("mongoose").SchemaDefinitionProperty<Date | undefined, ShippingInfo, Document<unknown, {}, ShippingInfo, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ShippingInfo & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    deliveredAt?: import("mongoose").SchemaDefinitionProperty<Date | undefined, ShippingInfo, Document<unknown, {}, ShippingInfo, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ShippingInfo & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, ShippingInfo>;
export declare class OrderPricing {
    subtotal: number;
    totalMrp: number;
    totalDiscount: number;
    couponCode?: string;
    couponDiscount: number;
    tax: number;
    shippingFee: number;
    grandTotal: number;
}
export declare const OrderPricingSchema: MongooseSchema<OrderPricing, import("mongoose").Model<OrderPricing, any, any, any, any, any, OrderPricing>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, OrderPricing, Document<unknown, {}, OrderPricing, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<OrderPricing & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    subtotal?: import("mongoose").SchemaDefinitionProperty<number, OrderPricing, Document<unknown, {}, OrderPricing, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<OrderPricing & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    totalMrp?: import("mongoose").SchemaDefinitionProperty<number, OrderPricing, Document<unknown, {}, OrderPricing, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<OrderPricing & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    totalDiscount?: import("mongoose").SchemaDefinitionProperty<number, OrderPricing, Document<unknown, {}, OrderPricing, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<OrderPricing & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    couponCode?: import("mongoose").SchemaDefinitionProperty<string | undefined, OrderPricing, Document<unknown, {}, OrderPricing, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<OrderPricing & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    couponDiscount?: import("mongoose").SchemaDefinitionProperty<number, OrderPricing, Document<unknown, {}, OrderPricing, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<OrderPricing & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    tax?: import("mongoose").SchemaDefinitionProperty<number, OrderPricing, Document<unknown, {}, OrderPricing, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<OrderPricing & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    shippingFee?: import("mongoose").SchemaDefinitionProperty<number, OrderPricing, Document<unknown, {}, OrderPricing, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<OrderPricing & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    grandTotal?: import("mongoose").SchemaDefinitionProperty<number, OrderPricing, Document<unknown, {}, OrderPricing, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<OrderPricing & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, OrderPricing>;
export declare class OrderTimeline {
    status: OrderStatus;
    title: string;
    timestamp: Date;
    notes?: string;
}
export declare const OrderTimelineSchema: MongooseSchema<OrderTimeline, import("mongoose").Model<OrderTimeline, any, any, any, any, any, OrderTimeline>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, OrderTimeline, Document<unknown, {}, OrderTimeline, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<OrderTimeline & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    status?: import("mongoose").SchemaDefinitionProperty<OrderStatus, OrderTimeline, Document<unknown, {}, OrderTimeline, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<OrderTimeline & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    title?: import("mongoose").SchemaDefinitionProperty<string, OrderTimeline, Document<unknown, {}, OrderTimeline, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<OrderTimeline & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    timestamp?: import("mongoose").SchemaDefinitionProperty<Date, OrderTimeline, Document<unknown, {}, OrderTimeline, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<OrderTimeline & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    notes?: import("mongoose").SchemaDefinitionProperty<string | undefined, OrderTimeline, Document<unknown, {}, OrderTimeline, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<OrderTimeline & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, OrderTimeline>;
export declare class Order {
    orderNumber: string;
    invoiceNumber: string;
    userId?: Types.ObjectId;
    guestId?: string;
    customerInfo: {
        email: string;
        firstName: string;
        lastName: string;
        phone: string;
    };
    shippingAddress: OrderAddress;
    billingAddress: OrderAddress;
    items: OrderItem[];
    paymentInfo: PaymentInfo;
    shippingInfo: ShippingInfo;
    pricing: OrderPricing;
    orderStatus: OrderStatus;
    timeline: OrderTimeline[];
    returnInfo?: {
        reason?: string;
        requestedAt?: Date;
        approvedAt?: Date;
        notes?: string;
    };
    cancellationReason?: string;
    isDeleted: boolean;
}
export declare const OrderSchema: MongooseSchema<Order, import("mongoose").Model<Order, any, any, any, any, any, Order>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Order, Document<unknown, {}, Order, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Order & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    orderNumber?: import("mongoose").SchemaDefinitionProperty<string, Order, Document<unknown, {}, Order, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Order & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    invoiceNumber?: import("mongoose").SchemaDefinitionProperty<string, Order, Document<unknown, {}, Order, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Order & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    userId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId | undefined, Order, Document<unknown, {}, Order, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Order & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    guestId?: import("mongoose").SchemaDefinitionProperty<string | undefined, Order, Document<unknown, {}, Order, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Order & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    customerInfo?: import("mongoose").SchemaDefinitionProperty<{
        email: string;
        firstName: string;
        lastName: string;
        phone: string;
    }, Order, Document<unknown, {}, Order, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Order & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    shippingAddress?: import("mongoose").SchemaDefinitionProperty<OrderAddress, Order, Document<unknown, {}, Order, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Order & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    billingAddress?: import("mongoose").SchemaDefinitionProperty<OrderAddress, Order, Document<unknown, {}, Order, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Order & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    items?: import("mongoose").SchemaDefinitionProperty<OrderItem[], Order, Document<unknown, {}, Order, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Order & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    paymentInfo?: import("mongoose").SchemaDefinitionProperty<PaymentInfo, Order, Document<unknown, {}, Order, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Order & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    shippingInfo?: import("mongoose").SchemaDefinitionProperty<ShippingInfo, Order, Document<unknown, {}, Order, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Order & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    pricing?: import("mongoose").SchemaDefinitionProperty<OrderPricing, Order, Document<unknown, {}, Order, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Order & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    orderStatus?: import("mongoose").SchemaDefinitionProperty<OrderStatus, Order, Document<unknown, {}, Order, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Order & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    timeline?: import("mongoose").SchemaDefinitionProperty<OrderTimeline[], Order, Document<unknown, {}, Order, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Order & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    returnInfo?: import("mongoose").SchemaDefinitionProperty<{
        reason?: string;
        requestedAt?: Date;
        approvedAt?: Date;
        notes?: string;
    } | undefined, Order, Document<unknown, {}, Order, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Order & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    cancellationReason?: import("mongoose").SchemaDefinitionProperty<string | undefined, Order, Document<unknown, {}, Order, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Order & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    isDeleted?: import("mongoose").SchemaDefinitionProperty<boolean, Order, Document<unknown, {}, Order, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Order & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, Order>;
