'use client';
import { Button } from '@/components/ui/button';
import { useReducer, Reducer, useEffect, useCallback } from 'react';

import {
	orderControlReducer,
	initialState,
	StateType,
	ActionType,
	OrderType,
} from '@/reducers/orderControlReducer';
import ListPanel from '@/components/ListPanel';
import RolePanel from '@/components/RolePanel';
import useTimers from '@/hooks/useTime';


export default function Home() {
	const [state, dispatch] = useReducer<Reducer<StateType, ActionType>>(
		orderControlReducer,
		initialState
	);
	const { addTimer, removeTimer, clearAllTimers, timerIds } = useTimers();
	const { bots, orders }: StateType = state;

	const findSpareBot = useCallback(
		() => bots.find((bot) => bot.precessing === null),
		[bots]
	);
	const findSpareOrder = useCallback(
		() => orders.find((order) => order.status === 'pending'),
		[orders]
	);

	// 在每次狀態更新後，檢查是否有空閒的機器人與訂單，並進行處理
	useEffect(() => {
		const spareBot = findSpareBot();
		const spareOrder = findSpareOrder();
		if (!spareBot || !spareOrder) return;

		dispatch({
			type: 'PRECESS_ORDER',
			payload: {
				botId: spareBot.id,
				orderId: spareOrder.id,
			},
		});
		const id = setTimeout(() => {
			dispatch({
				type: 'COMPLETE_ORDER',
				payload: {
					botId: spareBot.id,
					orderId: spareOrder.id,
				},
			});
			// 移除已完成的計時器 ID
			removeTimer(id);
		}, 10000);

		addTimer(id, spareBot.id);
	}, [bots, orders, addTimer, findSpareBot, findSpareOrder]);

	// 在頁面卸載時，清除所有計時器
	useEffect(() => {
		clearAllTimers();
	}, []);

	const handleAddBot = useCallback(() => {
		dispatch({ type: 'ADD_BOT', payload: bots.length + 1 });
	}, [dispatch, bots]);

	const handleRemoveBot = useCallback(() => {
		// if (bots.length > 1) {
			const lastBot = bots[bots.length - 1];

			// 如果機器人正在處理訂單，則取消訂單
			if (lastBot.precessing !== null) {
				const timer = timerIds.find((timer) => timer.botId === lastBot.id);
				if (timer) {
					removeTimer(timer.id);
				}

				dispatch({
					type: 'CANCEL_ORDER',
					payload: {
						orderId: lastBot.precessing,
					},
				});
			}
			dispatch({ type: 'REMOVE_BOT', payload: lastBot.id });
		// }
	}, [bots, timerIds, removeTimer, dispatch]);

	const handleAddOrder = useCallback(
		(id: number, orderType: OrderType['orderType']) => {
			dispatch({
				type: 'ADD_ORDER',
				payload: { id: id, orderType: orderType },
			});
		},
		[dispatch]
	);

	return (
		<main className="grid md:grid-cols-3 gap-4 md:gap-8 justify-center h-screen p-4 md:p-20 auto-rows-max">
			<RolePanel title="manger">
				<div className="flex gap-2">
					<Button className="add-bot" onClick={handleAddBot}>
						+ Bot
					</Button>
					<Button
						className="remove-bot"
						disabled={bots.length < 1}
						onClick={handleRemoveBot}
					>
						- Bot
					</Button>
				</div>
			</RolePanel>

			<RolePanel title="vip customer">
				<Button
					className="add-vip-order border-red-900 text-red-900"
					variant="outline"
					onClick={() => handleAddOrder(Date.now(), 'VIP')}
				>
					New VIP Order
				</Button>
			</RolePanel>
			<RolePanel title="normal customer">
				<Button
					className="add-normal-order border-black"
					variant="outline"
					onClick={() => handleAddOrder(Date.now(), 'normal')}
				>
					New Normal Order
				</Button>
			</RolePanel>

			<ListPanel title="bots" bots={bots} />

			<ListPanel
				title="pending"
				orders={orders.filter((order) => order.status === 'pending')}
			/>
			<ListPanel
				title="complete"
				orders={orders.filter((order) => order.status === 'complete')}
			/>
		</main>
	);
}
