import styles from "@/components/header/header.module.css";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";

export function Header() {
    const { data: session, status } = useSession();
    return (
        <header className={styles.header}>
            <section className={styles.content}>
                <nav className={styles.nav}>
                    <Link href='/'>
                        <h1 className={styles.logo}>Tarefas<span>Plus</span></h1>
                    </Link>
                    {session?.user && (
                        <Link className={styles.link} href='/dashboard'>
                            Meu painel
                        </Link>
                    )}
                </nav>
                {status === 'loading' ? (
                    <></>
                ) : session ? (
                    <button className={styles.loginButton} onClick={() => signOut()}>
                        Olá {session?.user?.name}
                    </button>
                ) : (
                    <button className={styles.loginButton} onClick={() => signIn('google')}>
                        <p>Login com</p>
                        <FcGoogle size={30} /> 
                    </button>
                )
                }
            </section>
        </header>
    )
}