import { SignupForm } from "@/components/signup-form";
import { BookUser } from "lucide-react";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="flex items-center space-x-2 mb-8">
        <BookUser className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold">
          <span className="font-light">LCI:</span> Mural de Influência
        </h1>
      </div>
      <div className="w-full max-w-sm">
        <SignupForm />
      </div>
    </div>
  );
}
