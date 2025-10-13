import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8">
      <h1 className="text-5xl font-bold text-gradient">Testapp1-Leapmile</h1>
      <Link to="/about">
        <Button size="lg">Go to about</Button>
      </Link>
    </div>
  );
};

export default Index;
