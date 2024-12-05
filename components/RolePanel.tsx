import React from 'react';
import { cn } from '@/lib/utils';

const RolePanel = ({ title, children }: { title: string; children: React.ReactNode }) => {
  return (
		<div
			className={cn(
				`role-panel-${title}`,
				'rounded-xl border shadow p-10 flex flex-col gap-6 items-center h-[200px]'
			)}
		>
			<h3 className="role-panel-title uppercase font-bold text-center">
				{title}
			</h3>
			{children}
		</div>
	);
};

export default RolePanel;
