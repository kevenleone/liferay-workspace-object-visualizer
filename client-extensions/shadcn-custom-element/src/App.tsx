import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from './components/ui/button';

export default function App() {
    return (
        <div className='p-4'>
            <h1 className='text-6xl text-bold text-red-900'>Liferay with Tailwind</h1>

            <Button onClick={() => alert("Ok!")}>Click here</Button>

            <Avatar>
                <AvatarImage src="https://github.com/kevenleone.png" />
                <AvatarFallback>KL</AvatarFallback>
            </Avatar>
        </div>
    );
}
