import React from 'react';

const RolePanel = ({ title, children }: { title: string; children: React.ReactNode }) => {
  return (
    <div className="rounded-xl border shadow p-10 flex flex-col gap-6 items-center h-[200px]">
      <h3 className="uppercase font-bold text-center">{title}</h3>
      {children}
    </div>
  );
};

export default RolePanel;
