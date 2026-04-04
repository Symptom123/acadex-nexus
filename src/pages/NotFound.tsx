import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-transparent px-6">
      <div className="text-center max-w-md">
        <p className="text-8xl font-bold tracking-tighter mb-4">404</p>
        <h1 className="text-2xl font-semibold mb-3">Page not found</h1>
        <p className="text-muted-foreground mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/">
          <Button variant="outline" className="rounded-full px-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
