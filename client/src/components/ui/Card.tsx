import type { ReactNode } from 'react';

interface CardProps {
  title: string;
  children: ReactNode;
  className?: string;
}

function Card({ title, children, className = '' }: CardProps) {
  return (
    <section className={`rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 ${className}`}>
      <h2 className="mb-4 text-sm font-medium text-gray-500">{title}</h2>
      {children}
    </section>
  );
}

export default Card;