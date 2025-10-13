import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Button onClick={() => navigate(-1)} size="lg">
        Go Back
      </Button>
    </div>
  );
};

export default About;
