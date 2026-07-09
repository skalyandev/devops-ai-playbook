import apiClient from './api';
import { Order } from '../types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const orderService = {
  createOrder: async (orderData: {
    items: { productId: string; quantity: number }[];
    shippingAddress: any;
  }): Promise<Order> => {
    const response = await apiClient.post<ApiResponse<Order>>(
      '/orders',
      orderData
    );
    return response.data.data;
  },

  getUserOrders: async (): Promise<Order[]> => {
    const response = await apiClient.get<ApiResponse<Order[]>>(
      '/orders/my-orders'
    );
    return response.data.data;
  },

  getOrderById: async (id: string): Promise<Order> => {
    const response = await apiClient.get<ApiResponse<Order>>(
      `/orders/${id}`
    );
    return response.data.data;
  },

  updateOrderStatus: async (
    id: string,
    status: string
  ): Promise<Order> => {
    const response = await apiClient.patch<ApiResponse<Order>>(
      `/orders/${id}/status`,
      { status }
    );
    return response.data.data;
  },
};
