type Timer = {
	id: NodeJS.Timeout;
	botId: number;
};

type TimerActionType =
	| { type: 'ADD_TIMER'; payload: Timer }
	| { type: 'REMOVE_TIMER'; payload: NodeJS.Timeout }
	| { type: 'CLEAR_TIMERS' };

export const timerReducer = (state : Timer[] = [], action: TimerActionType): Timer[] => {
	switch (action.type) {
		case 'ADD_TIMER':
			return [...state, action.payload];
		case 'REMOVE_TIMER':
			return state.filter((timer) => timer.id !== action.payload);
		case 'CLEAR_TIMERS':
			return [];
		default:
			return state;
	}
};
