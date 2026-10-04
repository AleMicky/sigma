import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
  type ListRenderItem,
} from "react-native";
import { type ReactNode } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Skeleton } from "@/components/ui/Skeleton";
import { colors, spacing } from "@/theme";

export type DataListProps<T> = {
  data?: T[];
  renderItem: ListRenderItem<T>;
  keyExtractor: (item: T, index: number) => string;
  loading?: boolean;
  loadingMore?: boolean;
  refreshing?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onEndReached?: () => void;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  skeletonCount?: number;
  ListHeaderComponent?: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

export function DataList<T>({
  data = [],
  renderItem,
  keyExtractor,
  loading = false,
  loadingMore = false,
  refreshing = false,
  error,
  onRefresh,
  onEndReached,
  onRetry,
  emptyTitle = "Sin resultados",
  emptyDescription = "No se encontraron registros.",
  emptyActionLabel,
  onEmptyAction,
  skeletonCount = 4,
  ListHeaderComponent,
  contentContainerStyle,
}: DataListProps<T>) {
  if (loading && !refreshing) {
    return (
      <View style={styles.skeletonContainer}>
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <View key={index} style={styles.skeletonCard}>
            <Skeleton variant="rectangular" height={68} />
          </View>
        ))}
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <ErrorMessage
          variant="card"
          title="Error al cargar datos"
          message={error}
          onRetry={onRetry}
        />
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      showsVerticalScrollIndicator={false}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.3}
      ListHeaderComponent={ListHeaderComponent ? <>{ListHeaderComponent}</> : null}
      contentContainerStyle={[
        styles.content,
        data.length === 0 && styles.empty,
        contentContainerStyle,
      ]}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        ) : undefined
      }
      ListEmptyComponent={
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          actionLabel={emptyActionLabel}
          onAction={onEmptyAction}
        />
      }
      ListFooterComponent={
        loadingMore ? (
          <View style={styles.footerLoader}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingVertical: spacing.sm,
  },
  empty: {
    flexGrow: 1,
    justifyContent: "center",
  },
  separator: {
    height: spacing.sm,
  },
  skeletonContainer: {
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  skeletonCard: {
    borderRadius: 10,
    overflow: "hidden",
  },
  errorContainer: {
    padding: spacing.lg,
  },
  footerLoader: {
    paddingVertical: spacing.md,
    alignItems: "center",
  },
});