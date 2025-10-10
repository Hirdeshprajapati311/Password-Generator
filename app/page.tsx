import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const page = async () => {

  const cookieStore = await cookies()
  const token  = cookieStore.get("token")?.value


  if (token) {
    return redirect("/vault")
  } else {
    return redirect("/auth/login")
  }
}

export default page;
