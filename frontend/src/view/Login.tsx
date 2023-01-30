import Button from "../components/Button";
import Card from "../components/Card";
import Input from "../components/Input";

export default function Login() {
  
  return (
    <main class="flex items-center justify-center h-full">
      <Card class="p-6 w-">
        <h1 class="text-xl font-bold mt-0 text-blue-900">Password</h1>
        <Input
          class="w-65"
          placeholder="Empty if you don't have password."
          type="password"
        />
        <div>
          <Button class="w-full mt-4">Authorization</Button>
        </div>
      </Card>
    </main>
  );
}
