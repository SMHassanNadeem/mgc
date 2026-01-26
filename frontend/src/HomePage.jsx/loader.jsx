import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useContext, useEffect } from 'react'

export default function FormLoader() {
    const queryClient = useQueryClient()
    const navigate = useNavigate()

    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    async function getOrders() {
        const token = localStorage.getItem('token');
        if (!token) {
            await delay(1000);
            navigate('/', {
                state: {
                    from: '/order-form',
                    message: 'Please Login',
                    timestamp: Date.now()
                },
                replace: true
            });
            return [];
        }
        const data = await fetch('http://localhost:3000/orders/loader-auth-check', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
        })
        if (data?.status === 401) {
            localStorage.removeItem('token');
            await delay(1000);
            navigate('/', {
                state: {
                    from: '/order-form',
                    message: 'Please Login',
                    timestamp: Date.now()
                },
                replace: true
            });
            return [];
        }
        if (data?.status === 403) {
            await delay(1000);
            navigate('/', {
                state: {
                    from: '/order-form',
                    message: 'Admin will approve your account soon',
                    timestamp: Date.now()
                },
                replace: true
            });
            return [];
        }
        if (!data?.ok) {
            throw new Error(`HTTP error! status: ${data.status}`);
        }
        const info = await data.json()
        if(info?.message === "approved"){
            navigate('/order-form')
        }
        if(info?.message === "vendor"){
            navigate('/vendor-page')
        }
        return []
    }
    const { data: apiData, isLoading: ordersLoading, error: ordersError } = useQuery({
        queryKey: ['userOrders'],
        queryFn: getOrders,
        retry: 1,
        refetchOnWindowFocus: false,
    })
    return (
        <>
            <div className="w-screen h-screen flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-gray-300 border-t-red-400 rounded-full animate-spin"></div>
            </div>
        </>
    )
}