export interface LayoutProps {
  children: React.ReactNode;
}

export interface UserProps {
  username: string;
  email: string;
  full_name: string;
  is_manager: boolean;
  disabled: boolean;
}

export interface UserListProps extends UserProps {
  id: string;
}

export interface UserAddProps extends UserProps {
  password: string;
  confirmPassword: string;
}

export interface ContentProps {
  user: UserProps;
}

export interface TaskProps {
  user_id: string;
  title: string;
  description: string | null;
  completed: boolean;
}

export interface TaskListProps extends TaskProps {
  id: string;
}

export interface LoginProps {
  username: string;
  password: string;
}
