import React from 'react'

interface Props {
    singInFn: () => void
}

const GoogleSignInButton = ({singInFn}: Props) => {
  return (
    <div dir='ltr' className="flex items-center justify-center dark:bg-gray-800 w-full mt-3">
    <button onClick={singInFn} className="flex-1 justify-center items-center px-4 py-2 border flex gap-2 border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-900 dark:hover:text-slate-300 hover:shadow transition duration-150">
        <img className="w-6 h-6" src="https://www.svgrepo.com/show/475656/google-color.svg" loading="lazy" alt="google logo" />
        <span>Google</span>
        <span>الدخول بواسطة حساب</span>
    </button>
</div>
  )
}

export default GoogleSignInButton