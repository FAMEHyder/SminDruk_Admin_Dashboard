import { Construction } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ComingSoonProps {
  title: string;
  description?: string;
}

export function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-xl bg-muted">
            <Construction className="size-6 text-muted-foreground" />
          </div>
          <CardTitle>Section in progress</CardTitle>
          <CardDescription>
            This module is part of the admin roadmap and will be wired to backend APIs next.
          </CardDescription>
        </CardHeader>
        <CardContent />
      </Card>
    </div>
  );
}
