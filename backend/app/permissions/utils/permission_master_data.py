PERMISSION_DATA = {
    "dashboard": ["overview", "add_branch", "create_branch"],

    "employee_management": {
        "employee": ["list", "add", "edit", "delete", "enable_disable"],
        "salary_structure": [],
        "payroll": []
    },

    "membership_plan": {
        "membership_plan": ["list", "add", "edit", "delete", "enable_disable"]
    },

    "crm": {
        "member": ["list", "add"],
        "visitor": ["list", "convert_to_member"],
        "guest": ["list", "convert_to_member"],
        "leads": []
    },

    "network": {
        "network": ["list", "network_request_approve", "add_network_amount", "enable_disable"]
    },

    "attendance": {},
    "wallet": {"wallet": ["add_topup"]},
    "inventory": {},
    "billing": {},
    "account": {},
    "branding": {},
    "report": {},
    "role": {},
    "notification": {},
    "profile": {"profile": ["edit_profile"]}
}