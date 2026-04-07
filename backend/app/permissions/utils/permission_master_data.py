PERMISSION_DATA = [
    {
        "id": "dashboard",
        "submodules": ["overview", "add_branch", "create_branch"]
    },
    {
        "id": "employee_management",
        "submodules": ["employee", "salary_structure", "payroll"],
        "actions": {
            "employee": ["list", "add", "edit", "delete", "enable_disable"]
        }
    },
    {
        "id": "membership_plan",
        "submodules": ["list", "add", "edit", "delete", "enable_disable"]
    },
    {
        "id": "crm",
        "submodules": ["member", "leads", "guest", "visitor"],
        "actions": {
            "member": ["list", "add", "edit", "delete", "enable_disable"],
            "visitor": ["add", "convert_to_member"],
            "guest": ["convert_to_member"]
        }
    },
    {
        "id": "network",
        "submodules": ["list", "netwrok_request_approve", "add_network_amount", "enable_disable"]
    },
    {"id": "attendance"},
    {
        "id": "wallet",
        "submodules": ["add_topup"]
    },
    {"id": "inventory"},
    {"id": "billing"},
    {"id": "account"},
    {"id": "branding"},
    {"id": "report"},
    {"id": "role"},
    {"id": "notification"},
    {
        "id": "profile",
        "submodules": ["edit_profile"]
    }
]