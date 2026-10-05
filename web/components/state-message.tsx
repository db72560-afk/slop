export function StateMessage({
  title,
  description,
  action,
  heading = 'h1',
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  heading?: 'h1' | 'h2';
}) {
  const Title = heading;
  return (
    <div className="border border-line bg-panel px-5 py-12 text-center sm:px-8">
      <Title className="text-xl font-semibold tracking-tight text-ink">{title}</Title>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">{description}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}
