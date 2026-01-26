import { Dialog, DialogActions, DialogTitle, Button } from '@mui/material'
import { useContext, useEffect, useRef, useState } from 'react';
import { Global } from '../global';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function EditUser({ vendorId }) {

    const queryClient = useQueryClient()

    const { openMenuAddUser, setOpenMenuAddUser, openMenuLogin, setOpenMenuLogin } = useContext(Global)
    const formRef = useRef(null);

    const [formData, setFormData] = useState({
        CompanyName: "",
        PhoneNo: "",
        PickupAddress: "",
        cnicCopyImage: "",
        Cnic: "",
        personOfContact: "",
        Email: "",
        BankName: "",
        AccNo: "",
        BranchCode: "",
        IBAN: "",
        AccTitle: "",
        BranchName: "",
        SwiftCode: "",
        password: "",
        storeLink: ""
    });
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const notificationTimerRef = useRef(null);
    useEffect(() => {
        return () => {
            if (notificationTimerRef.current) {
                clearTimeout(notificationTimerRef.current);
            }
        };
    }, []);
    const [notification, setNotification] = useState({
        show: false,
        message: '',
        type: 'error'
    });

    async function addUserLogic(formData) {
        try {
            const formRes = await fetch(`http://localhost:3000/users/${vendorId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    CompanyName: formData.CompanyName,
                    PhoneNo: formData.PhoneNo,
                    PickupAddress: formData.PickupAddress,
                    Cnic: formData.Cnic,
                    personOfContact: formData.personOfContact,
                    Email: formData.Email,
                    BankName: formData.BankName,
                    AccNo: formData.AccNo,
                    BranchCode: formData.BranchCode,
                    IBAN: formData.IBAN,
                    AccTitle: formData.AccTitle,
                    BranchName: formData.BranchName,
                    SwiftCode: formData.SwiftCode,
                    password: formData.password,
                    storeLink: formData.storeLink,
                })
            })
            const data = await formRes.json();
            if (!formRes.ok) {
                throw new Error(data.message || 'Signup failed');
            }

            // toast.success(data?.message , {
            //     position: "top-right",
            //     autoClose: 3000,
            // })
            // clear previous timer if exists
            if (notificationTimerRef.current) {
                clearTimeout(notificationTimerRef.current);
            }
            setNotification({
                show: true,
                message: "Edited Successfully",
                type: 'success'
            });
            notificationTimerRef.current = setTimeout(() => {
                setNotification(prev => ({ ...prev, show: false }));
                notificationTimerRef.current = null;
            }, 3000);


            setFormData({
                CompanyName: "",
                PhoneNo: "",
                PickupAddress: "",
                cnicCopyImage: "",
                Cnic: "",
                personOfContact: "",
                Email: "",
                BankName: "",
                AccNo: "",
                BranchCode: "",
                IBAN: "",
                AccTitle: "",
                BranchName: "",
                SwiftCode: "",
                password: "",
                storeLink: ""

            });
            return data;
        } catch (error) {
            console.error('Error confirming order:', error);
            if (notificationTimerRef.current) {
                clearTimeout(notificationTimerRef.current);
            }
            setNotification({
                show: true,
                message: error?.message,
                type: 'error'
            });
            notificationTimerRef.current = setTimeout(() => {
                setNotification(prev => ({ ...prev, show: false }));
                notificationTimerRef.current = null;
            }, 3000);
        }
    }

    const addUserMutation = useMutation({
        mutationFn: addUserLogic,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['userData'] });
            setOpenMenuAddUser(false);
        },
        onError: (error) => {
            if (notificationTimerRef.current) {
                clearTimeout(notificationTimerRef.current);
            }
            setNotification({
                show: true,
                message: error?.message,
                type: 'error'
            });
            notificationTimerRef.current = setTimeout(() => {
                setNotification(prev => ({ ...prev, show: false }));
                notificationTimerRef.current = null;
            }, 3000);
        }
    })

    function addUser() {
        // e.preventDefault();
        addUserMutation.mutate(formData)
    }



    const [page, setPage] = useState(0)

    function nextPage() {
        setPage(prev => Math.min(prev + 1, 2));
    }

    function prevPage() {
        setPage(prev => Math.max(prev - 1, 0));
    }


    return (
        <div>
            <ToastContainer
                pauseOnHover
            />

            {notification.show && (
                <div
                    className="fixed top-5 right-5 z-[9999] px-4 py-3 rounded-lg shadow-lg text-white transition-all duration-300"
                    style={{
                        background: `${notification.type === "error" ? "#d10115" : "green"}`,
                        minWidth: '250px'
                    }}
                >
                    {notification.message}
                </div>
            )}

            <Dialog
                open={openMenuAddUser}
                onClose={(event, reason) => {
                    if (reason === "backdropClick" || reason === "escapeKeyDown") {
                        return;
                    }
                    setOpenMenuAddUser(false); // close only when you want not after clicking outside of dialog
                }}
                md
                maxWidth={false}
            >
                <DialogTitle
                    className='w-[320px]! sm:w-[500px]! md:w-[650px]!'
                    sx={{
                        paddingY: "10px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: 'flex-start',
                        gap: "1px",
                    }}
                >
                    <div className="p-6 w-full flex flex-col gap-0 items-start">
                        <h4 className='pb-4 w-fit mx-auto text-gray-600! text-md! font-bold!' >
                            User Info
                            <b onClick={() => setOpenMenuAddUser(false)} className='cursor-pointer absolute right-0 mr-10'>X</b>
                        </h4>
                        <form className='w-full flex flex-col'>
                            {page === 0 && (
                                <fieldset disabled={page !== 0}>
                                    <div className="overflow-hidden flex flex-col sm:flex-row! gap-[5%]">
                                        <div className="flex flex-col sm:flex-row! w-full gap-3">
                                            <div className="w-full sm:w-[47.5%] flex flex-col gap-1">
                                                <label className='font-bold text-gray-500 text-[15px]'>User Name</label>
                                                <input type="text" placeholder='user name' name="CompanyName" value={formData.CompanyName} onChange={handleChange} className='border w-full rounded py-2 pl-3 text-[17px]! shadow-sm shadow-black/20 text-gray-900 h-13! focus:outline-blue-500! mb-2!' />
                                                <label className='font-bold text-gray-500 text-[15px]'>Phone No</label>
                                                <input name="PhoneNo" value={formData.PhoneNo} onChange={handleChange} type="number" className=' shadow-sm shadow-black/20 text-gray-900 h-13! focus:outline-blue-500! mb-2! border w-full rounded py-2 pl-3 text-[17px]!' placeholder='phone no' />
                                                <label className='font-bold text-gray-500 text-[15px]'>Pickup Address:</label>
                                                <input name="PickupAddress" value={formData.PickupAddress} onChange={handleChange} type="text" className=' shadow-sm shadow-black/20 text-gray-900 h-13! focus:outline-blue-500! mb-2! border w-full rounded py-2 pl-3 text-[17px]!' placeholder='Pickup Address' />
                                                <label className='font-bold text-gray-500 text-[15px]'>CNIC Number:</label>
                                                <input name="Cnic" value={formData.Cnic} onChange={handleChange} type="number" className=' shadow-sm shadow-black/20 text-gray-900 h-13! focus:outline-blue-500! mb-2! border w-full rounded py-2 pl-3 text-[17px]!' placeholder='cnic no' />
                                            </div>
                                            <div className="w-full sm:w-[47.5%] flex flex-col gap-1">
                                                <label className='font-bold text-gray-500 text-[15px]'>Person of Contact:</label>
                                                <input name="personOfContact" value={formData.personOfContact} onChange={handleChange} type="text" className='text-gray-900 h-13! focus:outline-blue-500! mb-2! shadow-sm shadow-black/20 border w-full rounded py-2 pl-3 text-[17px]!' placeholder='name' />
                                                <label className='font-bold text-gray-500 text-[15px]'>Email:</label>
                                                <input name="Email" value={formData.Email} onChange={handleChange} type="text" className=' text-gray-900 h-13! focus:outline-blue-500! mb-2! shadow-sm shadow-black/20 border w-full rounded py-2 pl-3 text-[17px]!' placeholder='email address' />
                                                <label className='font-bold text-gray-500 text-[15px]'>Store Link (optional)</label>
                                                <input name="storeLink" value={formData.storeLink} onChange={handleChange} type="text" className=' text-gray-900 h-13! focus:outline-blue-500! mb-2! shadow-sm shadow-black/20 border w-full rounded py-2 pl-3 text-[17px]!' placeholder='Store Link' />
                                                {/* <label className='font-bold text-gray-500 text-[15px]'>Picture of CNIC:</label>
                                                <input  name="cnicCopyImage" value={formData.cnicCopyImage} onChange={handleChange} type="file" className='text-gray-900 h-13! focus:outline-blue-500! mb-2! shadow-sm shadow-black/20 border w-full rounded py-2 pl-3 text-[17px]!' placeholder='Pickup Address:' /> */}
                                            </div>
                                        </div>
                                    </div>
                                </fieldset>
                            )}
                            {page === 1 && (
                                <fieldset disabled={page !== 1}>
                                    <div className="overflow-hidden flex flex-col sm:flex-row! gap-[5%]">
                                        <div className="flex flex-col sm:flex-row! w-full gap-3">
                                            <div className="w-full sm:w-[47.5%] flex flex-col gap-1">
                                                <label className='font-bold text-gray-500 text-[15px]'>Bank Name</label>
                                                <input type="text" placeholder='enter bank name' name="BankName" value={formData.BankName} onChange={handleChange} className='text-gray-900 h-13! focus:outline-blue-500! mb-2! shadow-sm shadow-black/20 border w-full rounded py-2 pl-3 text-[17px]!' />
                                                <label className='font-bold text-gray-500 text-[15px]'>Account No</label>
                                                <input name="AccNo" value={formData.AccNo} onChange={handleChange} type="number" className='text-gray-900 h-13! focus:outline-blue-500! mb-2! shadow-sm shadow-black/20 border w-full rounded py-2 pl-3 text-[17px]!' placeholder='account no' />
                                                <label className='font-bold text-gray-500 text-[15px]'>Branch Code:</label>
                                                <input name="BranchCode" value={formData.BranchCode} onChange={handleChange} type="text" className='text-gray-900 h-13! focus:outline-blue-500! mb-2! shadow-sm shadow-black/20 border w-full rounded py-2 pl-3 text-[17px]!' placeholder='enter branch code' />
                                                <label className='font-bold text-gray-500 text-[15px]'>IBAN:</label>
                                                <input name="IBAN" value={formData.IBAN} onChange={handleChange} type="number" className='text-gray-900 h-13! focus:outline-blue-500! mb-2! shadow-sm shadow-black/20 border w-full rounded py-2 pl-3 text-[17px]!' placeholder='IBAN' />
                                            </div>
                                            <div className="w-full sm:w-[47.5%] flex flex-col gap-1">
                                                <label className='font-bold text-gray-500 text-[15px]'>Account Title:</label>
                                                <input name="AccTitle" value={formData.AccTitle} onChange={handleChange} type="text" className='text-gray-900 h-13! focus:outline-blue-500! mb-2! shadow-sm shadow-black/20 border w-full rounded py-2 pl-3 text-[17px]!' placeholder='enter account title' />
                                                <label className='font-bold text-gray-500 text-[15px]'>Branch Name:</label>
                                                <input name="BranchName" value={formData.BranchName} onChange={handleChange} type="text" className='text-gray-900 h-13! focus:outline-blue-500! mb-2! shadow-sm shadow-black/20 border w-full rounded py-2 pl-3 text-[17px]!' placeholder='enter branch name' />
                                                <label className='font-bold text-gray-500 text-[15px]'>Swift Code:</label>
                                                <input name="SwiftCode" value={formData.SwiftCode} onChange={handleChange} type="number" className='text-gray-900 h-13! focus:outline-blue-500! mb-2! shadow-sm shadow-black/20 border w-full rounded py-2 pl-3 text-[17px]!' placeholder='Swift Code:' />
                                            </div>
                                        </div>
                                    </div>
                                </fieldset>
                            )}
                            {page === 2 && (
                                <fieldset disabled={page !== 2}>
                                    <div className="overflow-hidden flex flex-col sm:flex-row! gap-[5%]">
                                        <div className="flex flex-col sm:flex-row! w-full gap-1">
                                            <div className="w-full sm:w-full flex flex-col gap-2">
                                                <label className='font-bold text-gray-500 text-[15px]'>Password:</label>
                                                <input name="password" value={formData.password} id="pass" onChange={handleChange} type="password" className='text-gray-900 h-13! focus:outline-blue-500! mb-2! shadow-sm shadow-black/20 border w-full rounded py-2 pl-3 text-[17px]!' placeholder='Password' />
                                                {/* <button className='relative w-fit -top-15 left-[90%]' type='button' onClick={() => {
                                                    const input = document.getElementById('pass');
                                                    if (input.type === 'password') {
                                                        input.type = 'text';
                                                    } else {
                                                        input.type = 'password';
                                                    }
                                                }}>
                                                    <i className="fa-regular fa-eye"></i>
                                                </button> */}
                                            </div>
                                        </div>
                                    </div>
                                </fieldset>
                            )}
                            {page === 2 ? (
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
                                        onClick={() => addUser()}
                                        type="button"
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
    )
}