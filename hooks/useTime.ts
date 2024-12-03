import { useReducer, useCallback } from 'react';
import { timerReducer } from '@/reducers/timerReducer';

 const useTimers = () => {
	const [timerIds, timerDispatch] = useReducer(timerReducer, []);

	const addTimer = useCallback((id: NodeJS.Timeout, botId: number) => {
		timerDispatch({ type: 'ADD_TIMER', payload: { id, botId } });
	}, []);

	const removeTimer = useCallback((timeId: NodeJS.Timeout) => {
		timerDispatch({ type: 'REMOVE_TIMER', payload: timeId });
		clearTimeout(timeId);
	}, []);

	const clearAllTimers = useCallback(() => {
		timerIds.forEach((timer) => clearTimeout(timer.id));
		timerDispatch({ type: 'CLEAR_TIMERS' });
	}, [timerIds]);

	return { addTimer, removeTimer, clearAllTimers, timerIds };
};

export default useTimers;
