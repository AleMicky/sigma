import { Text, View } from "react-native";
import { TrashIcon } from "@/src/components/icons";
import {
    AlertDialog,
    AlertDialogBackdrop,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
} from "@/src/components/ui/alert-dialog";
import { Button, ButtonSpinner, ButtonText } from "@/src/components/ui/button";

export interface ConfirmDeleteDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    itemName?: string;
    description?: string;
    isLoading?: boolean;
    confirmLabel?: string;
    cancelLabel?: string;
}

export function ConfirmDeleteDialog({
    isOpen,
    onClose,
    onConfirm,
    title = "Eliminar Registro",
    itemName,
    description,
    isLoading = false,
    confirmLabel = "Eliminar",
    cancelLabel = "Cancelar",
}: ConfirmDeleteDialogProps) {
    return (
        <AlertDialog isOpen={isOpen} onClose={onClose} size="md">
            <AlertDialogBackdrop />
            <AlertDialogContent className="rounded-3xl bg-white p-5 max-w-[340px] shadow-2xl border border-slate-100">
                <AlertDialogHeader className="pb-2">
                    <View className="flex-row items-center gap-2.5">
                        <View className="h-9 w-9 rounded-2xl bg-rose-50 items-center justify-center border border-rose-100">
                            <TrashIcon size={18} color="#e11d48" />
                        </View>
                        <Text className="text-base font-bold text-slate-900">
                            {title}
                        </Text>
                    </View>
                </AlertDialogHeader>

                <AlertDialogBody className="py-2">
                    {description ? (
                        <Text className="text-xs text-slate-600 leading-relaxed">
                            {description}
                        </Text>
                    ) : (
                        <Text className="text-xs text-slate-600 leading-relaxed">
                            ¿Estás seguro de que deseas eliminar{" "}
                            {itemName ? (
                                <Text className="font-bold text-slate-900">
                                    {itemName}
                                </Text>
                            ) : (
                                "este elemento"
                            )}
                            ? Esta acción es permanente y no se podrá deshacer.
                        </Text>
                    )}
                </AlertDialogBody>

                <AlertDialogFooter className="pt-4 flex-row gap-2 justify-end">
                    <Button
                        variant="outline"
                        size="sm"
                        onPress={onClose}
                        disabled={isLoading}
                        className="rounded-xl border-slate-200"
                    >
                        <ButtonText className="text-xs font-semibold text-slate-700">
                            {cancelLabel}
                        </ButtonText>
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onPress={onConfirm}
                        disabled={isLoading}
                        className="rounded-xl bg-rose-600 active:bg-rose-700"
                    >
                        {isLoading ? (
                            <ButtonSpinner color="#ffffff" />
                        ) : (
                            <ButtonText className="text-xs font-bold text-white">
                                {confirmLabel}
                            </ButtonText>
                        )}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
