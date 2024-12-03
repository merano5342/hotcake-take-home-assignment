import React from 'react';
import { BotType, OrderType } from '@/reducers/orderControlReducer';

type OrderPanelProps =
	| { title: string; orders: OrderType[]; bots?: never }
	| { title: string; orders?: never; bots: BotType[] };

const ListPanel = ({ title, orders, bots }: OrderPanelProps) => {
	const list = orders || bots || [];
	return (
		<div className="order-panel rounded-xl border border-black bg-card text-card-foreground max-h-[400px] flex flex-col py-4 h-full">
			<h3 className="uppercase font-bold text-center">
				{title} <span className='opacity-40'>({list.length})</span>
			</h3>
			<div className="section-orders overflow-y-auto space-y-2 mt-4 px-6">
				{/* 訂單顯示 */}
				{orders &&
					orders?.map((order) => (
						<div
							key={order.id}
							className="flex gap-4 items-center justify-start"
						>
							<p>
								{order.orderType === 'VIP' && (
									<span className="bg-red-900 text-white text-sm rounded p-1">
										VIP
									</span>
								)}
								<span> {order.id}</span>
							</p>
						</div>
					))}

				{/* 機器人顯示 */}
				{bots &&
					bots?.map((bot) => (
						<div key={bot.id} className="flex gap-4 items-center justify-start">
							<p className="bg-slate-500 px-3 py-1 text-white">{bot.id}</p>
							<p className="text-blue-500">
								{bot.precessing === null ? '空閒' : bot.precessing}
							</p>
						</div>
					))}
			</div>
		</div>
	);
};

export default ListPanel;