import { CalendarDays, MapPin } from "lucide-react";
import { Card } from "./Card";
import { Button } from "./Button";

export type EventItem = {
  title: string;
  description?: string;
  date?: string;
  location?: string;
  href?: string;
  category?: string;
};

type EventListProps = {
  items: EventItem[];
};

export function EventList({ items }: EventListProps) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {items.map((event) => (
        <Card
          key={`${event.title}-${event.date ?? ""}`}
          title={event.title}
          eyebrow={event.category}
          description={event.description}
          interactive={Boolean(event.href)}
          className="flex h-full flex-col"
        >
          <div className="mt-auto grid gap-2 text-sm text-stone-700">
            {event.date ? (
              <p className="flex items-center gap-2">
                <CalendarDays className="size-4 shrink-0 text-emerald-800" aria-hidden="true" />
                <span>{event.date}</span>
              </p>
            ) : null}
            {event.location ? (
              <p className="flex items-center gap-2">
                <MapPin className="size-4 shrink-0 text-emerald-800" aria-hidden="true" />
                <span>{event.location}</span>
              </p>
            ) : null}
          </div>
          {event.href ? (
            <Button href={event.href} variant="ghost" className="mt-4 w-full justify-between px-0 hover:bg-transparent">
              詳細を見る
            </Button>
          ) : null}
        </Card>
      ))}
    </div>
  );
}
