import { Dialog, DialogActions, DialogTitle, Button } from '@mui/material'
import { useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Users() {
    const navigate = useNavigate()
    const [apiData, setApiData] = useState()
    useEffect(() => {
        async function a() {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/');
                return;
            }

            const data = await fetch('http://localhost:3000/users/approved', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
            })
            if (data?.status === 401) {
                localStorage.removeItem('token');
                navigate('/');
                return;
            }
            if (data?.status === 403) {
                // Not authorized (not admin)
                navigate('/');
                return;
            }
            if (!data?.ok) {
                throw new Error(`HTTP error! status: ${data.status}`);
            }
            const info = await data.json()
            setApiData(info?.user)
        }
        a();
    }, [])

    const [searchTerm, setSearchTerm] = useState("")
    const filteredData = apiData?.filter((item) =>
        [
            item?.CompanyName,
            item?._id,
        ].some((field) =>
            String(field).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    return (
        <div className=" overflow-y-scroll bg-gray-100 flex flex-col gap-4 p-2 justify-start items-start w-7/8! sm:w-3/4 h-screen">
            <div className="bg-white px-[2%] py-[2%] text-center rounded flex items-center justify-start w-full">
                <label htmlFor="search"><i className="fas fa-search text-gray-400 m-0 p-0"></i></label>
                <input onChange={(e) => setSearchTerm(e.target.value)} id="search" className="rounded pl-2 w-[150px] sm:w-full focus:outline-0 text-md! font-medium" type="search" placeholder="Search" />
            </div>

            <div className="flex items-center justify-between w-full">
                <h4>Users</h4>
            </div>

            <div className="w-full text-white">
                {
                    filteredData?.length !== 0
                        ?
                        filteredData?.map((a) => (
                            <>
                                <div onClick={() => navigate(`/admin/users/${a?._id}`)} className='bg-gray-50 cursor-pointer flex justify-between items-center mb-3! shadow shadow-black/30 py-3 pl-2 rounded'>
                                    <div className='flex items-center'>
                                        <div className='mr-10 bg-blue-900 rounded-[50%] h-20 w-20 flex justify-center items-center'>
                                            <h2 className="p-4 text-center text-nowrap">{a?.CompanyName[0].toUpperCase()}</h2>
                                        </div>
                                        <div className="text-black flex flex-col justify-between h-15">
                                            <h3 className="text-justify text-nowrap font-bold">{a?.CompanyName}</h3>
                                            <div className="text-justify text-nowrap">{a?.Email}</div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ))
                        :
                        <h1 className='text-black'>No Approved User found</h1>
                }
            </div>
        </div>
    )
}