import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: ['http://localhost:5173', 'https://your-app-name.vercel.app'],
  },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  // Frontend se "join-tenant" event aayega connect hote hi
  @SubscribeMessage('join-tenant')
  handleJoinTenant(
    @MessageBody() tenantId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`tenant-${tenantId}`);
    console.log(`Client ${client.id} joined tenant-${tenantId}`);
  }
notifyNewOrder(tenantId: string, data: any) {
  this.server.to(`tenant-${tenantId}`).emit('new-meal-order', data);
}
  notifyLowStock(tenantId: string, ingredient: any) {
    this.server.to(`tenant-${tenantId}`).emit('low-stock-alert', {
      message: `${ingredient.name} is running low (${ingredient.stockLevel} ${ingredient.unit} left)`,
      ingredient,
    });
  }

  notifyOrderCountFinal(tenantId: string, data: any) {
    this.server.to(`tenant-${tenantId}`).emit('order-count-final', data);
  }
}