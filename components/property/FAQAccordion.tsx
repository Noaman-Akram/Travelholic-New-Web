import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils/cn";

export function FAQAccordion({
  items,
  defaultOpenFirst = false,
  className,
}: {
  items: { q: string; a: string }[];
  defaultOpenFirst?: boolean;
  className?: string;
}) {
  return (
    <Accordion
      type="single"
      collapsible
      defaultValue={defaultOpenFirst ? "item-0" : undefined}
      className={cn("w-full", className)}
    >
      {items.map((item, i) => (
        <AccordionItem key={i} value={`item-${i}`}>
          <AccordionTrigger>{item.q}</AccordionTrigger>
          <AccordionContent>
            <p className="text-pretty">{item.a}</p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
