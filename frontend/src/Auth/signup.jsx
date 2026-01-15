import { Dialog, DialogActions, DialogTitle, Button } from '@mui/material'
import { useContext, useEffect, useRef, useState } from 'react';
import { Global } from '../global';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Signup() {
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
        confPass: "",
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

    async function addUser(e) {
        e.preventDefault();
        if (!formRef.current.checkValidity()) {
            formRef.current.reportValidity();
            return;
        }
        const formRes = await fetch('http://localhost:3000/users/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
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
                BranchName: formData.BranchCode,
                SwiftCode: formData.SwiftCode,
                password: formData.password,
            })
        })
        const data = await formRes.json();
        localStorage.setItem("token", data?.token);
        toast.success(data?.message, {
            position: "top-right",
            autoClose: 3000,
        })
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
            confPass: "",
        });
        setOpenMenuAddUser(false);
    }

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

    const { openMenuAddUser, setOpenMenuAddUser, openMenuLogin, setOpenMenuLogin } = useContext(Global)
    const formRef = useRef(null);

    return (
        <>
            <ToastContainer
                pauseOnHover
            />
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
                        <form ref={formRef} onSubmit={addUser} className='w-full flex flex-col'>
                            {page === 0 && (
                                <fieldset disabled={page !== 0}>
                                    <div className="overflow-hidden flex flex-col sm:flex-row! gap-[5%]">
                                        <div className="flex flex-col sm:flex-row! w-full gap-3">
                                            <div className="w-full sm:w-[47.5%] flex flex-col gap-1">
                                                <label className='font-bold text-gray-500 text-[15px]'>Your Name</label>
                                                <input type="text" placeholder='your name' required name="CompanyName" value={formData.CompanyName} onChange={handleChange} className='border w-full rounded py-2 pl-3 text-[17px]! shadow-sm shadow-black/20 text-gray-900 h-13! focus:outline-blue-500! mb-2!' />
                                                <label className='font-bold text-gray-500 text-[15px]'>Phone No</label>
                                                <input required name="PhoneNo" value={formData.PhoneNo} onChange={handleChange} type="number" className=' shadow-sm shadow-black/20 text-gray-900 h-13! focus:outline-blue-500! mb-2! border w-full rounded py-2 pl-3 text-[17px]!' placeholder='phone no' />
                                                <label className='font-bold text-gray-500 text-[15px]'>Pickup Address:</label>
                                                <input required name="PickupAddress" value={formData.PickupAddress} onChange={handleChange} type="text" className=' shadow-sm shadow-black/20 text-gray-900 h-13! focus:outline-blue-500! mb-2! border w-full rounded py-2 pl-3 text-[17px]!' placeholder='Pickup Address' />
                                                <label className='font-bold text-gray-500 text-[15px]'>CNIC Number:</label>
                                                <input required name="Cnic" value={formData.Cnic} onChange={handleChange} type="number" className=' shadow-sm shadow-black/20 text-gray-900 h-13! focus:outline-blue-500! mb-2! border w-full rounded py-2 pl-3 text-[17px]!' placeholder='cnic no' />
                                            </div>
                                            <div className="w-full sm:w-[47.5%] flex flex-col gap-1">
                                                <label className='font-bold text-gray-500 text-[15px]'>Person of Contact:</label>
                                                <input required name="personOfContact" value={formData.personOfContact} onChange={handleChange} type="text" className='text-gray-900 h-13! focus:outline-blue-500! mb-2! shadow-sm shadow-black/20 border w-full rounded py-2 pl-3 text-[17px]!' placeholder='name' />
                                                <label className='font-bold text-gray-500 text-[15px]'>Email:</label>
                                                <input required name="Email" value={formData.Email} onChange={handleChange} type="text" className=' text-gray-900 h-13! focus:outline-blue-500! mb-2! shadow-sm shadow-black/20 border w-full rounded py-2 pl-3 text-[17px]!' placeholder='email address' />
                                                {/* <label className='font-bold text-gray-500 text-[15px]'>Store Link</label>
                                            <input name="storeLink" value={formData.storeLink} onChange={handleChange} type="text" className=' text-gray-900 h-13! focus:outline-blue-500! mb-2! shadow-sm shadow-black/20 border w-full rounded py-2 pl-3 text-[17px]!' placeholder='Store Link' />
                                            <label className='font-bold text-gray-500 text-[15px]'>Picture of CNIC:</label>
                                            <input required name="cnicCopyImage" value={formData.cnicCopyImage} onChange={handleChange} type="file" className='text-gray-900 h-13! focus:outline-blue-500! mb-2! shadow-sm shadow-black/20 border w-full rounded py-2 pl-3 text-[17px]!' placeholder='Pickup Address:' /> */}
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
                                                <input type="text" placeholder='enter bank name' required name="BankName" value={formData.BankName} onChange={handleChange} className='text-gray-900 h-13! focus:outline-blue-500! mb-2! shadow-sm shadow-black/20 border w-full rounded py-2 pl-3 text-[17px]!' />
                                                <label className='font-bold text-gray-500 text-[15px]'>Account No</label>
                                                <input required name="AccNo" value={formData.AccNo} onChange={handleChange} type="number" className='text-gray-900 h-13! focus:outline-blue-500! mb-2! shadow-sm shadow-black/20 border w-full rounded py-2 pl-3 text-[17px]!' placeholder='account no' />
                                                <label className='font-bold text-gray-500 text-[15px]'>Branch Code:</label>
                                                <input required name="BranchCode" value={formData.BranchCode} onChange={handleChange} type="text" className='text-gray-900 h-13! focus:outline-blue-500! mb-2! shadow-sm shadow-black/20 border w-full rounded py-2 pl-3 text-[17px]!' placeholder='enter branch code' />
                                                <label className='font-bold text-gray-500 text-[15px]'>IBAN:</label>
                                                <input required name="IBAN" value={formData.IBAN} onChange={handleChange} type="number" className='text-gray-900 h-13! focus:outline-blue-500! mb-2! shadow-sm shadow-black/20 border w-full rounded py-2 pl-3 text-[17px]!' placeholder='IBAN' />
                                            </div>
                                            <div className="w-full sm:w-[47.5%] flex flex-col gap-1">
                                                <label className='font-bold text-gray-500 text-[15px]'>Account Title:</label>
                                                <input required name="AccTitle" value={formData.AccTitle} onChange={handleChange} type="text" className='text-gray-900 h-13! focus:outline-blue-500! mb-2! shadow-sm shadow-black/20 border w-full rounded py-2 pl-3 text-[17px]!' placeholder='enter account title' />
                                                <label className='font-bold text-gray-500 text-[15px]'>Branch Name:</label>
                                                <input required name="BranchName" value={formData.BranchName} onChange={handleChange} type="text" className='text-gray-900 h-13! focus:outline-blue-500! mb-2! shadow-sm shadow-black/20 border w-full rounded py-2 pl-3 text-[17px]!' placeholder='enter branch name' />
                                                <label className='font-bold text-gray-500 text-[15px]'>Swift Code:</label>
                                                <input required name="SwiftCode" value={formData.SwiftCode} onChange={handleChange} type="number" className='text-gray-900 h-13! focus:outline-blue-500! mb-2! shadow-sm shadow-black/20 border w-full rounded py-2 pl-3 text-[17px]!' placeholder='Swift Code:' />
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
                                                <input required name="password" value={formData.password} id="pass" onChange={handleChange} type="password" className='text-gray-900 h-13! focus:outline-blue-500! mb-2! shadow-sm shadow-black/20 border w-full rounded py-2 pl-3 text-[17px]!' placeholder='Password' />
                                                <button className='relative w-fit -top-15 left-[90%]' type='button' onClick={() => {
                                                    const input = document.getElementById('pass');
                                                    if (input.type === 'password') {
                                                        input.type = 'text';
                                                    } else {
                                                        input.type = 'password';
                                                    }
                                                }}>
                                                    <i class="fa-regular fa-eye"></i>
                                                </button>
                                                <label className='font-bold text-gray-500 text-[15px]'>Confirm Password:</label>
                                                <input ref={confPassRef} id='pass2' required name="confPass" value={formData.confPass} onChange={handleChange} type="password" className='text-gray-900 h-13! focus:outline-blue-500! mb-2! shadow-sm shadow-black/20 border w-full rounded py-2 pl-3 text-[17px]!' placeholder='confirm password' />
                                                <button className='relative w-fit -top-15 left-[90%]' type='button' onClick={() => {
                                                    const input = document.getElementById('pass2');
                                                    if (input.type === 'password') {
                                                        input.type = 'text';
                                                    } else {
                                                        input.type = 'password';
                                                    }
                                                }}>
                                                    <i class="fa-regular fa-eye"></i>
                                                </button>
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
        </>
    )
}