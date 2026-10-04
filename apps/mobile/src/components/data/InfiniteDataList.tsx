import { ReactElement, memo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  FlatListProps,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  RefreshControl,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { radius, spacing, typography, useAppTheme } from "@/theme";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { AppButton } from "@/components/ui/AppButton";

export type InfiniteDataListProps<T> = Omit<
  FlatListProps<T>,
  "data" | "renderItem" | "refreshControl" | "ListEmptyComponent" | "ListFooterComponent"
> & {
  data: T[];
  renderItem: (info: { item: T; index: number }) => ReactElement | null;
  keyExtractor?: (item: T, index: number) => string;

  // Infinite Scroll & Query Props (compatible with React Query useInfiniteQuery)
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  isLoading?: boolean;
  isError?: boolean;
  error?: Error | string | null;
  refetch?: () => void | Promise<any>;

  // Refresh Props
  isRefreshing?: boolean;
  onRefresh?: () => void | Promise<any>;

  // Empty State Props
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: keyof typeof Ionicons.glyphMap;
  emptyAction?: {
    label: string;
    onPress: () => void;
  };

  // Loading Placeholders
  skeletonCount?: number;
  showScrollToTop?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
};

function InfiniteDataListComponent<T>({
  data,
  renderItem,
  keyExtractor = (item: any, index) => item?.id?.toString() ?? index.toString(),
  onEndReached,
  onEndReachedThreshold = 0.4,
  hasNextPage = false,
  isFetchingNextPage = false,
  isLoading = false,
  isError = false,
  error,
  refetch,
  isRefreshing = false,
  onRefresh,
  emptyTitle = "No se encontraron registros",
  emptyDescription = "No hay elementos para mostrar en este momento.",
  emptyIcon = "folder-open-outline",
  emptyAction,
  skeletonCount = 4,
  showScrollToTop = true,
  containerStyle,
  contentContainerStyle,
  ...flatListProps
}: InfiniteDataListProps<T>) {
  const { colors, isDark } = useAppTheme();
  const listRef = useRef<FlatList<T>>(null);
  const [showScrollTopBtn, setShowScrollTopBtn] = useState<boolean>(false);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    if (showScrollToTop) {
      if (offsetY > 350 && !showScrollTopBtn) {
        setShowScrollTopBtn(true);
      } else if (offsetY <= 350 && showScrollTopBtn) {
        setShowScrollTopBtn(false);
      }
    }
    flatListProps.onScroll?.(event);
  };

  const scrollToTop = () => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  // Render Skeleton Initial Loading
  if (isLoading && (!data || data.length === 0)) {
    return (
      <View style={[styles.skeletonContainer, containerStyle]}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <View
            key={`skel-${i}`}
            style={[
              styles.skeletonCard,
              {
                backgroundColor: isDark ? colors.surface : colors.background,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.skeletonRow}>
              <Skeleton width={44} height={44} borderRadius={radius.md} />
              <View style={styles.skeletonFlex}>
                <Skeleton width="75%" height={16} borderRadius={radius.sm} />
                <Skeleton width="45%" height={12} borderRadius={radius.sm} />
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  }

  // Render Error State
  if (isError && (!data || data.length === 0)) {
    return (
      <View style={[styles.errorContainer, containerStyle]}>
        <View style={[styles.errorCircle, { backgroundColor: colors.dangerLight }]}>
          <Ionicons name="alert-circle-outline" size={38} color={colors.danger} />
        </View>
        <Text style={[styles.errorTitle, { color: colors.text }]}>
          Error al cargar datos
        </Text>
        <Text style={[styles.errorDescription, { color: colors.textSecondary }]}>
          {typeof error === "string"
            ? error
            : error?.message || "Ocurrió un error inesperado al consultar el servidor."}
        </Text>
        {refetch ? (
          <AppButton
            title="Reintentar Carga"
            variant="primary"
            onPress={refetch}
            leftIcon={<Ionicons name="refresh-outline" size={18} color={colors.white} />}
          />
        ) : null}
      </View>
    );
  }

  // Render Footer (Infinite Scroll Loading Spinner)
  const renderFooter = () => {
    if (isFetchingNextPage) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Cargando más registros...
          </Text>
        </View>
      );
    }

    if (!hasNextPage && data.length > 0) {
      return (
        <View style={styles.footerEnd}>
          <View style={[styles.endLine, { backgroundColor: colors.border }]} />
          <Text style={[styles.endText, { color: colors.textMuted }]}>
            Fin de la lista ({data.length} elementos)
          </Text>
          <View style={[styles.endLine, { backgroundColor: colors.border }]} />
        </View>
      );
    }

    return null;
  };

  // Render Empty State
  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        icon={emptyIcon}
        actionLabel={emptyAction?.label}
        onAction={emptyAction?.onPress}
      />
    );
  };

  return (
    <View style={[styles.root, containerStyle]}>
      <FlatList
        ref={listRef}
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            onEndReached?.();
          }
        }}
        onEndReachedThreshold={onEndReachedThreshold}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          ) : undefined
        }
        nestedScrollEnabled={flatListProps.nestedScrollEnabled ?? true}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[
          styles.contentContainer,
          data.length === 0 && styles.emptyContent,
          contentContainerStyle,
        ]}
        {...flatListProps}
      />

      {/* Botón flotante para subir al inicio */}
      {showScrollTopBtn ? (
        <Pressable
          onPress={scrollToTop}
          style={[
            styles.scrollTopBtn,
            {
              backgroundColor: isDark ? colors.surfaceSecondary : colors.background,
              borderColor: colors.border,
              shadowColor: "#000000",
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Subir al inicio de la lista"
        >
          <Ionicons name="arrow-up" size={20} color={colors.primary} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    position: "relative",
  },
  contentContainer: {
    paddingVertical: spacing.sm,
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  skeletonContainer: {
    gap: spacing.md,
    padding: spacing.md,
  },
  skeletonCard: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  skeletonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  skeletonFlex: {
    flex: 1,
    gap: 8,
  },
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.md,
  },
  errorCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  errorTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  errorDescription: {
    fontSize: typography.fontSize.sm,
    textAlign: "center",
    lineHeight: 20,
  },
  footerLoader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  footerText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  footerEnd: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.lg,
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  endLine: {
    flex: 1,
    height: 1,
  },
  endText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  scrollTopBtn: {
    position: "absolute",
    bottom: spacing.lg,
    right: spacing.lg,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    elevation: 5,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
});

export const InfiniteDataList = memo(InfiniteDataListComponent) as typeof InfiniteDataListComponent;
