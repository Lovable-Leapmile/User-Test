import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Link to="/about">
        <Button size="lg">Go to about</Button>
      </Link>
    </div>
  );
};

export default Index;
