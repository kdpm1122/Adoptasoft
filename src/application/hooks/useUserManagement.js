// src/application/hooks/useUserManagement.js
import { useState, useCallback } from "react";
import { validateNewUserForm } from "../../domain/services/userValidation";
import { userRepository } from "../../infrastructure/repositories/userRepository";

const initialForm = { fullName: "", email: "", role: "", phone: "", document: "", password: "" };

export function useUserManagement(initialUsers = []) {
  const [users, setUsers] = useState(initialUsers);
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const setField = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const createUser = useCallback(async () => {
    const { isValid, errors: validationErrors } = validateNewUserForm(formData);
    setErrors(validationErrors);
    if (!isValid) return { success: false };
    setIsLoading(true);
    try {
      const newUser = await userRepository.create(formData);
      setUsers((prev) => [newUser, ...prev]);
      setFormData(initialForm);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, [formData]);

  const deleteUser = useCallback(async (id) => {
    await userRepository.remove(id);
    setUsers((prev) => prev.filter((u) => String(u.id) !== String(id)));
  }, []);

  const updateUser = useCallback(async (id, payload) => {
    const updated = await userRepository.update(id, payload);
    setUsers((prev) => prev.map((u) => (String(u.id) === String(id) ? { ...u, ...updated } : u)));
    return updated;
  }, []);

  return { users, formData, setField, errors, isLoading, createUser, deleteUser, updateUser };
}
