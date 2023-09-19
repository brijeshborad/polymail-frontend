import dynamic from 'next/dynamic'
const LoginSignup = dynamic(
    () => import('@/components/auth').then((mod) => mod.LoginSignup)
)

export default function Signup() {
    return (
        <LoginSignup type={'signup'}/>
    )
}
