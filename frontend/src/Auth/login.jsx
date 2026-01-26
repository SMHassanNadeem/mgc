import { Dialog, DialogActions, DialogTitle, Button } from '@mui/material'
import { useContext, useState } from 'react';
import { Global } from '../global';
import { useNavigate } from 'react-router-dom'

export default function Login() {
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const [apiData,setApiData] = useState("");
    async function submit(e) {
        e.preventDefault();
        const loginRes = await fetch('http://localhost:3000/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                Email: formData.email,
                password: formData.password,
            })
        })
        const data = await loginRes.json()
        setApiData(data);
        localStorage.setItem("token", data?.token);
        if (data?.message === "admin") {
            navigate('/admin')
            setOpenMenuLogin(false);
        }
        if (data?.message === "approved") {
            navigate('/order-form')
            setOpenMenuLogin(false);
            localStorage.setItem("name", data?.name);
        }
        if (data?.message === "rider") {
            navigate('/rider')
            setOpenMenuLogin(false);
        }
        if (data?.message === "vendor") {
            navigate('/vendor-page')
            setOpenMenuLogin(false);
            localStorage.setItem("name", data?.name);
        }
        setFormData({
            email: "",
            password: "",
        });
    }
    const { openMenuAddUser, setOpenMenuAddUser, openMenuLogin, setOpenMenuLogin } = useContext(Global)
    return (
        <Dialog
            className=' mt-32!'
            open={openMenuLogin}
            onClose={() => setOpenMenuLogin(false)}
            md
            maxWidth={false}
        >
            <DialogTitle
                className='w-[250px]! sm:w-[300px]! md:w-[400px]!'
                sx={{
                    padding: "10px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: 'flex-start',
                    gap: "1px",
                }}
            >
                <div className="px-5 w-full flex flex-col gap-0 items-start">
                    <h3 className='text-gray-600! text-md! font-medium! py-3 mx-auto' > Login </h3>
                    <form onSubmit={submit} className='w-full flex flex-col gap-1'>
                        <label className='text-gray-600 text-[15px]'>Email :</label>
                        <input required className='text-gray-800! border-gray-500! border w-full rounded py-2 pl-3 text-[17px]!' name="email" value={formData.email} onChange={handleChange} placeholder="enter email address" type="text" />
                        <label className='text-gray-600 text-[15px]'>Password :</label>
                        <input required className='text-gray-800! border-gray-500! border w-full rounded py-2 pl-3 text-[17px]!' name="password" value={formData.password} onChange={handleChange} placeholder="enter password" type="password" />
                        <label className='text-red-500 text-sm'>{apiData?.message}</label>
                        <label className='text-sm mt-2'> Create an account? <a href='#' onClick={() => { setOpenMenuLogin(false), setOpenMenuAddUser(true) }}>click here</a> </label>
                        <button type='submit' className='my-4! py-3 bg-red-400 text-white rounded'>Add</button>
                    </form>
                </div>
            </DialogTitle>
        </Dialog>
    )
}