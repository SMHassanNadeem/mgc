import { Dialog, DialogActions, DialogTitle, Button } from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function RidersDeleted() {
    const [openMenu, setOpenMenu] = useState(false)
    const [openMenuAddUser, setOpenMenuAddUser] = useState(false)
    const [searchTerm, setSearchTerm] = useState("");

    const navigate = useNavigate()
    const queryClient = useQueryClient()

    async function getRidersLogic() {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }

        const data = await fetch('http://localhost:3000/riders/riders-deleted', {
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
        return info;
    }
    const { data: apiData, isLoading: ridersLoading, error: ridersError } = useQuery({
        queryKey: ['riders'],
        queryFn: getRidersLogic,
        retry: 1,
        refetchOnWindowFocus: false,
    })


    const [formData, setFormData] = useState({
        RiderName: "",
        ContactNo: "",
        EmailAddress: "",
        VehicleDetails: "",
        LicenseNo: "",
        RiderRefrenceNumber: "rider" + Date.now().toString().slice(5, 13),
        AssignedArea: "",
        confPass: "",
        password: "",
        cnic: "",
    });
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updated = { ...prev, [name]: value };
            if (name === "password" || name === "confPass") {
                validatePasswords(updated.password, updated.confPass);
            }
            return updated;
        });
    };
    const confPassRef = useRef(null);

    async function addRiderLogic(e) {
        const data = await fetch('http://localhost:3000/riders/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                ridersName: formData.RiderName,
                contactNo: formData.ContactNo,
                emailAddress: formData.EmailAddress,
                vehicle: formData.VehicleDetails,
                licenseNo: formData.LicenseNo,
                assignedArea: formData.AssignedArea,
                password: formData.password,
                cnic: formData.cnic,
            })
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
    }
    const addRiderMutation = useMutation({
        mutationFn: addRiderLogic,
        onSuccess: () => {
            setFormData({
                RiderName: "",
                ContactNo: "",
                EmailAddress: "",
                VehicleDetails: "",
                LicenseNo: "",
                RiderRefrenceNumber: "",
                AssignedArea: "",
                confPass: "",
                password: "",
                cnic: "",
            });
            setOpenMenuAddUser(false);
            queryClient.invalidateQueries({ queryKey: ['riders'] });
        },
        onError: (error) => {
            console.error('Error:', error);
            toast.error(`Failed : ${error.message}`, {
                position: "top-right",
                autoClose: 3000,
                style: {
                    background: '#d10115',
                    color: 'white',
                },
            })
        }
    })
    function addRider(e) {
        e.preventDefault();
        addRiderMutation.mutate(formData)
    }

    const filteredData = apiData?.filter((item) =>
        [
            item?.ridersName,
            item?._id,
        ].some((field) =>
            String(field).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    function validatePasswords(pass, conf) {
        if (!confPassRef.current) return;

        if (pass !== conf) {
            confPassRef.current.setCustomValidity("Passwords do not match");
        } else {
            confPassRef.current.setCustomValidity("");
        }
    }

    const [page, setPage] = useState(0)
    function nextPage() {
        if (!formRef.current) return;
        if (formRef.current.checkValidity()) {
            setPage(prev => Math.min(prev + 1, 2));
        } else {
            formRef.current.reportValidity();
        }
    }
    function prevPage() {
        setPage(prev => Math.max(prev - 1, 0));
    }
    const formRef = useRef(null);


    if (ridersLoading) {
        return (
            <div className="pt-25! overflow-scroll! bg-white flex flex-col p-4 justify-center items-center w-screen h-screen">
                <div className="text-center">
                    <p className="text-lg">Loading riders...</p>
                </div>
            </div>
        );
    }
    // Error state
    if (ridersError) {
        return (
            <div className="pt-25! overflow-scroll! bg-white flex flex-col p-4 justify-center items-center w-screen h-screen">
                <div className="text-center text-red-600">
                    <p className="text-lg">Error loading riders: {ridersError.message}</p>
                    <button
                        onClick={() => queryClient.refetchQueries({ queryKey: ['userOrders'] })}
                        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className=" overflow-y-scroll bg-gray-100 flex flex-col gap-4 p-2 justify-start items-start w-7/8! sm:w-3/4 h-screen">

            <ToastContainer
                pauseOnHover
            />

            <div className="bg-white px-[2%] py-[2%] text-center rounded flex items-center justify-start w-full">
                <label htmlFor="search"><i className="fas fa-search text-gray-400 m-0 p-0"></i></label>
                <input onChange={(e) => setSearchTerm(e.target.value)} id="search" className="rounded pl-2 w-[150px] sm:w-full focus:outline-0 text-md! font-medium" type="search" placeholder="Search" />
                {/* <button onClick={() => setOpenMenuAddUser(true)} className="bg-[#d10115] text-gray-100 font-medium py-2 px-4 rounded text-nowrap">Add Rider</button> */}
                <Dialog
                    open={openMenuAddUser}
                    onClose={() => setOpenMenuAddUser(false)}
                    md
                    maxWidth={false}
                >
                    <DialogTitle
                        sx={{
                            paddingY: "10px",
                            width: "45vw",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: 'flex-start',
                            gap: "1px",
                        }}
                    >
                        <div className="w-full flex flex-col gap-0 items-start">
                            {/* <h3 className='! text-md! font-medium!' > Create Rider Account </h3> */}
                            <form ref={formRef} onSubmit={addRider} className='w-full flex flex-col'>
                                <div className="flex gap-[5%]">
                                    <div className="w-full">
                                        {page === 0 && (
                                            <fieldset disabled={page !== 0}>
                                                <label className=' text-[17px]'>Rider Name:</label>
                                                <input required name="RiderName" value={formData.RiderName} onChange={handleChange} type="text" className='text-gray-900 h-13! focus:outline-blue-500! mb-2! shadow-sm shadow-black/20 border w-full rounded py-2 pl-3 text-[17px]!' placeholder='Rider Name' />
                                                <label className=' text-[17px]'>Contact No:</label>
                                                <input required name="ContactNo" value={formData.ContactNo} onChange={handleChange} type="text" className='text-gray-900 h-13! focus:outline-blue-500! mb-2! shadow-sm shadow-black/20 border w-full rounded py-2 pl-3 text-[17px]!' placeholder='Contact No' />
                                                <label className=' text-[17px]'>Email Address:</label>
                                                <input required name="EmailAddress" value={formData.EmailAddress} onChange={handleChange} type="text" className='text-gray-900 h-13! focus:outline-blue-500! mb-2! shadow-sm shadow-black/20 border w-full rounded py-2 pl-3 text-[17px]!' placeholder='Email Address' />
                                                <label className=' text-[17px]'>Vehicle:</label>
                                                <input required name="VehicleDetails" value={formData.VehicleDetails} onChange={handleChange} type="text" className='text-gray-900 h-13! focus:outline-blue-500! mb-2! shadow-sm shadow-black/20 border w-full rounded py-2 pl-3 text-[17px]!' placeholder='BIKE (no-plate)' />
                                                <label className=' text-[17px]'>License No:</label>
                                                <input required name="LicenseNo" value={formData.LicenseNo} onChange={handleChange} type="text" className='text-gray-900 h-13! focus:outline-blue-500! mb-2! shadow-sm shadow-black/20 border w-full rounded py-2 pl-3 text-[17px]!' placeholder='License Number' />
                                                <label className=' text-[17px]'>Assigned Area:</label>
                                                <input required name="AssignedArea" value={formData.AssignedArea} onChange={handleChange} type="text" className='text-gray-900 h-13! focus:outline-blue-500! mb-2! shadow-sm shadow-black/20 border w-full rounded py-2 pl-3 text-[17px]!' placeholder='Assigned Area' />
                                            </fieldset>)}
                                        {page === 1 && (
                                            <fieldset disabled={page !== 1}>
                                                <label className=' text-[17px]'>Password:</label>
                                                <input required name="password" value={formData.password} onChange={handleChange} type="password" className='text-gray-900 h-13! focus:outline-blue-500! mb-2! shadow-sm shadow-black/20 border w-full rounded py-2 pl-3 text-[17px]!' placeholder='password' />
                                                <label className=' text-[17px]'>Cnic:</label>
                                                <input required name="cnic" value={formData.cnic} onChange={handleChange} type="text" className='text-gray-900 h-13! focus:outline-blue-500! mb-2! shadow-sm shadow-black/20 border w-full rounded py-2 pl-3 text-[17px]!' placeholder='cnic' />
                                                <label className='font-bold text-gray-500 text-[15px]'>Confirm Password:</label>
                                                <input ref={confPassRef} required name="confPass" value={formData.confPass} onChange={handleChange} type="text" className='text-gray-900 h-13! focus:outline-blue-500! mb-2! shadow-sm shadow-black/20 border w-full rounded py-2 pl-3 text-[17px]!' placeholder='confirm password' />
                                            </fieldset>)}
                                    </div>
                                </div>
                                {page === 1 ? (
                                    <div className="flex w-full gap-2 py-3">
                                        <button
                                            type="button"
                                            disabled={page === 0}
                                            onClick={prevPage}
                                            className="w-1/2 bg-blue-400 text-white rounded py-1"
                                        >
                                            Back
                                        </button>

                                        <button
                                            type="submit"
                                            className="w-1/2 bg-red-400 text-white rounded py-1"
                                        >
                                            Submit
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex w-full gap-3 py-3">
                                        <button
                                            type="button"
                                            disabled={page === 0}
                                            onClick={prevPage}
                                            className={`w-1/2 ${page === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-blue-400 cursor-pointer"} text-white rounded py-1`}
                                        >
                                            Back
                                        </button>

                                        <button
                                            type="button"
                                            onClick={nextPage}
                                            className={`w-1/2 text-white rounded py-1 bg-red-400!`}
                                        >
                                            NEXT
                                        </button>
                                    </div>
                                )}
                            </form>
                        </div>
                    </DialogTitle>
                </Dialog>
            </div>

            <div className="flex items-center justify-between w-full">
                <h4>Riders</h4>
            </div>

            <div className="w-full h-auto text-white">
                {
                    filteredData?.length !== 0 ?
                        filteredData?.map((a) => (
                            <>
                                <div onClick={() => navigate(`/admin/riders/${a?._id}`)} className='bg-gray-50 cursor-pointer flex justify-between items-center mb-3! shadow shadow-black/30 py-3 pl-2 rounded'>
                                    <div className='flex items-center justify-between! w-full'>
                                        <div className='flex items-center'>
                                            <div className='mr-10 bg-blue-900 rounded-[50%] h-20 w-20 flex justify-center items-center'>
                                                <h2 className="p-4 text-center text-nowrap">{a?.ridersName[0].toUpperCase()}</h2>
                                            </div>
                                            <div className="text-black flex flex-col justify-between h-15">
                                                <h3 className="text-justify text-nowrap font-bold">{a?.ridersName}</h3>
                                                <div className="text-justify text-nowrap">{a?.emailAddress}</div>
                                            </div>
                                        </div>

                                        <div className="text-black flex flex-col justify-between h-15">
                                            <h3 className="mr-5 -mt-[7rem]! text-2xl! text-justify text-nowrap font-extrabold"
                                                style={{ color: a?.status === "activeRider" ? "green" : "#ff3d00" }}>
                                                <span style={{ fontSize: '9rem' }}>.</span>
                                            </h3>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ))
                        : <h1 className='text-black'>No Rider</h1>
                }
            </div>
        </div>
    )
}