export interface Permission {
  id: string;
  resource: string;
  action: string;
}

const permissions: Permission[] = {
  team: [
    {
      id: '1',
      resource: 'user',
      action: 'read',
    },
  ],
};

export default permissions;
