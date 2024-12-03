import { stat } from 'fs';

export type OrderType = {
	id: number;
	orderType: 'normal' | 'VIP';
	status: 'pending' | 'complete' | 'processing';
};
export type BotType = { id: number; precessing: null | number };
export type StateType = { bots: BotType[]; orders: OrderType[] };

export const initialState: StateType = {
	bots: [{ id: 0, precessing: null }],
	orders: [],
};
export type ActionType =
	| { type: 'ADD_BOT' }
	| { type: 'REMOVE_BOT' }
	| { type: 'ADD_ORDER'; payload: { id: number; orderType: 'normal' | 'VIP' } }
	| { type: 'PRECESS_ORDER'; payload: { botId: number; orderId: number } }
	| { type: 'CANCEL_ORDER'; payload: { orderId: number } }
	| { type: 'COMPLETE_ORDER'; payload: { botId: number; orderId: number } };

export const orderControlReducer = (
	state: StateType = initialState,
	action: ActionType
): StateType => {
	switch (action.type) {
		case 'ADD_BOT':
			return {
				...state,
				bots: [
					...state.bots,
					{ id: state.bots[state.bots.length - 1].id + 1, precessing: null },
				],
			};
		case 'REMOVE_BOT':
			const newBots = [...state.bots];
			newBots.pop();
			return {
				...state,
				bots: newBots,
			};
		case 'ADD_ORDER':
			const newOrder: OrderType = {
				id: action.payload.id,
				orderType: action.payload.orderType,
				status: 'pending',
			};
			let newOrders;
			if (newOrder.orderType === 'VIP') {
				const idx = state.orders.filter(
					(order) => order.orderType === 'VIP'
				).length;
				const orders = [...state.orders];
				orders.splice(idx, 0, newOrder);
				newOrders = orders;
			} else {
				newOrders = [...state.orders, newOrder];
			}
			return {
				...state,
				orders: newOrders,
			};

		case 'PRECESS_ORDER':
			const updatedBots = state.bots.map((bot) => {
				if (bot.id === action.payload.botId) {
					return { ...bot, precessing: action.payload.orderId };
				}
				return bot;
			});
			return {
				...state,
				bots: updatedBots,
				orders: state.orders.map((order) => {
					if (order.id === action.payload.orderId) {
						return { ...order, status: 'processing' };
					}
					return order;
				}),
			};
		case 'CANCEL_ORDER':
			return {
				...state,
				orders: state.orders.map((order) => {
					if (order.id === action.payload.orderId) {
						return { ...order, status: 'pending' };
					} else {
						return order;
					}
				}),
			};

	
		case 'COMPLETE_ORDER':
			return {
				...state,
				bots: state.bots.map((bot) => {
					if (bot.id === action.payload.botId) {
						return { ...bot, precessing: null };
					}
					return bot;
				}),
				orders: state.orders.map((order) => {
					if (order.id === action.payload.orderId) {
						return { ...order, status: 'complete' };
					}
					return order;
				}),
			};
		default:
			return state;
	}
};
