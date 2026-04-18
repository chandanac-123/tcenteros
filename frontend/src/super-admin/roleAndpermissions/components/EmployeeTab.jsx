import { DataTable } from '@common/components/DataTable';
import React from 'react'

const EmployeeTab = () => {
    const columns = [
        {
            accessorKey: "name",
            header: "Employee Name",
        },
        {
            accessorKey: "email",
            header: "Email",
        },
        {
            accessorKey: "phone",
            header: "Phone Number",
        },
        {
            accessorKey: "designation",
            header: "Designation",
        },
        {
            accessorKey: "pending",
            header: "Pending",
            cell: ({ row }) => {
                const value = row.original.pending;

                return (
                    <span
                        style={{
                            color: value === 0 ? "#03881B" : "#880303",
                            fontWeight: 500
                        }}
                    >
                        ₹{value}
                    </span>
                );
            }
        }
    ];

    const employeeData = [
        {
            name: "Anil Kumar S",
            email: "anilkumar354@gmail.com",
            phone: "9855488304",
            designation: "Trainer",
            pending: 2339
        },
        {
            name: "Priya Sharma",
            email: "priyasharma_fit@gmail.com",
            phone: "9876543210",
            designation: "Fitness Coach",
            pending: 3100
        },
        {
            name: "Ritu Kapoor",
            email: "ritu.kapoor@teamfit.io",
            phone: "9876541230",
            designation: "SaaS Product Manager",
            pending: 4200
        },
        {
            name: "Vikram Singh",
            email: "vikram.singh@teamfitpro.com",
            phone: "9900112233",
            designation: "Performance Analyst",
            pending: 3400
        },
        {
            name: "Rahul Verma",
            email: "rahul.verma@teamfitpro.com",
            phone: "9123456789",
            designation: "Nutrition Specialist",
            pending: 2850
        },
        {
            name: "Sneha Patil",
            email: "sneha.patil@fitcloud.io",
            phone: "9988776655",
            designation: "Wellness Coordinator",
            pending: 3250
        },
        {
            name: "Karan Mehta",
            email: "karan.mehta@teamfit.io",
            phone: "9871122334",
            designation: "Conditioning Coach",
            pending: 2950
        },
        {
            name: "Anita Joshi",
            email: "anita.joshi@fitmanage.com",
            phone: "9654321876",
            designation: "Group Fitness Instructor",
            pending: 2700
        },
        {
            name: "Neha Gupta",
            email: "neha.gupta@fitcloud.io",
            phone: "9765432109",
            designation: "Yoga Instructor",
            pending: 2600
        },
        {
            name: "Amit Desai",
            email: "amit.desai@fitmanage.com",
            phone: "9812345678",
            designation: "Recovery Specialist",
            pending: 3150
        }
    ];

    return (
        <div className='px-4'>
            <div className='shadow-[0px_5px_15px_rgba(0,0,0,0.35)] rounded-md p-4'>
                <DataTable
                    columns={columns}
                    data={employeeData}
                    loading={false}
                    // tableParams={tableParams}
                    // setTableParams={setTableParams}
                    pagination={11}
                    paginationVisibile={true}
                   search={false}
                />
            </div>
        </div>
    )
}

export default EmployeeTab
