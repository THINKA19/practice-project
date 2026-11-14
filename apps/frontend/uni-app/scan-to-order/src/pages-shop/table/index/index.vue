<script lang="ts" setup>
import { onShow } from '@dcloudio/uni-app'
import { computed, ref, watch } from 'vue'
import { t } from '@/locale'
import { shopText as st } from '@/locale/shop-text'
import { useMerchantPage } from '@/pages-shop/auth/permissions'
import { useMerchantNoticeLifecycle } from '@/pages-shop/shop/index'
import { useTableList } from './composables/index/useTableList'
import type { TableCard, TableOccupancy } from './models'

definePage({
  style: {
    navigationBarTitleText: '桌台看板',
    navigationBarBackgroundColor: '#faf7f4',
    backgroundColor: '#faf7f4',
  },
})

useMerchantNoticeLifecycle(useMerchantPage())
const { groups, activeCapacity, visibleGroups, stats, loading, loaded, error } = useTableList()
const statuses = ['occupied', 'vacant'] as const
const statusFilter = ref<Exclude<TableOccupancy, 'unknown'> | ''>('')
const displayedGroups = computed(() => visibleGroups.value.map(group => ({
  ...group,
  tables: group.tables.filter(table => !statusFilter.value || table.occupancy === statusFilter.value),
})).filter(group => group.tables.length))

function capacityTitle(seats: number | null) {
  return seats === null ? t('shop.tableBoard.unknownCapacity') : t('shop.tableBoard.capacity', { count: seats })
}

function cardStatus(table: TableCard) {
  if (table.full)
    return t('shop.tableBoard.full')
  if (table.occupancy === 'vacant')
    return t('shop.tableBoard.emptyTable')
  if (table.remainingSeats !== null)
    return t('shop.tableBoard.remaining', { count: table.remainingSeats })

  return t('shop.tableBoard.occupied')
}

function updateTitle() {
  uni.setNavigationBarTitle({ title: t('shop.tableBoard.title') })
}

watch([activeCapacity, () => groups.value.length > 0], () => {
  statusFilter.value = ''
})
onShow(updateTitle)
watch(() => t('shop.tableBoard.title'), updateTitle)
</script>

<template>
  <view class="board">
    <view class="board-header">
      <view class="board-inner">
        <wd-tabs v-if="groups.length > 1" v-model="activeCapacity" slidable="always" color="#6b503c" line-width="40">
          <wd-tab name="" :title="t('shop.tableBoard.allTables')" />
          <wd-tab v-for="group in groups" :key="group.id" :name="group.id" :title="capacityTitle(group.seats)" />
        </wd-tabs>

        <view v-if="visibleGroups.length" class="status-row">
          <button
            v-for="status in statuses"
            :key="status"
            class="board-button status-filter"
            :class="[`state--${status}`, { 'status-filter--selected': statusFilter === status }]"
            :aria-pressed="statusFilter === status"
            @click="statusFilter = statusFilter === status ? '' : status"
          >
            <text class="status-dot" />
            <text>{{ t(`shop.tableBoard.${status}`) }}</text>
            <text class="state-count">{{ stats[status] }}</text>
          </button>
        </view>

        <view v-if="error" class="board-error" role="alert">
          <view>{{ error === 'permission' ? t('shop.tableBoard.permission') : error === 'load' ? t('shop.tableBoard.failure') : st(error) }}</view>
          <view v-if="loaded">
            {{ t('shop.tableBoard.stale') }}
          </view>
        </view>
      </view>
    </view>

    <scroll-view :key="`${activeCapacity}/${statusFilter}`" scroll-y class="board-scroll">
      <view class="board-inner board-content">
        <view v-if="displayedGroups.some(group => group.tables.some(table => table.seatPositions.length))" class="seat-legend">
          {{ t('shop.tableBoard.seatLegend') }}
        </view>
        <view v-if="loading && !loaded" class="board-message">
          {{ t('shop.tableBoard.loading') }}
        </view>
        <view v-else-if="loaded && !groups.length && !error" class="board-message">
          {{ t('shop.tableBoard.empty') }}
        </view>
        <view v-else-if="visibleGroups.length && !displayedGroups.length" class="board-message">
          {{ t('shop.tableBoard.noResults') }}
        </view>

        <view v-for="group in displayedGroups" :key="group.id" class="table-group">
          <view class="group-title">
            <text>{{ capacityTitle(group.seats) }}</text>
            <text class="group-count">{{ t('shop.tableBoard.total', { count: group.tables.length }) }}</text>
          </view>
          <view class="table-grid">
            <view v-for="table in group.tables" :key="table.id" class="table-card" :class="table.full ? 'state--full' : `state--${table.occupancy}`">
              <text class="table-number">{{ table.no }}</text>
              <view class="table-status">
                <text class="status-dot" />
                <text>{{ cardStatus(table) }}</text>
              </view>
              <view v-if="table.seatPositions.length" class="seat-positions">
                <text
                  v-for="seat in table.seatPositions"
                  :key="seat.code"
                  class="seat-label"
                  :class="{ 'seat-label--occupied': seat.occupied }"
                  :aria-label="`${table.no}-${seat.code} · ${t(seat.occupied ? 'shop.tableBoard.occupied' : 'shop.tableBoard.vacant')}`"
                >
                  {{ seat.code }}
                </text>
              </view>
              <view class="seat-counts">
                <text>{{ t('shop.tableBoard.seated', { count: table.occupiedSeats ?? '—', total: table.seats ?? '—' }) }}</text>
                <text v-if="table.occupancy === 'vacant' && table.remainingSeats !== null">{{ t('shop.tableBoard.remaining', { count: table.remainingSeats }) }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<style scoped>
.board {
  position: fixed;
  inset: var(--window-top, 0px) 0 var(--window-bottom, 0px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  --wot-tabs-nav-bg: #fffdfb;
  --wot-tabs-nav-line-bg: #6b503c;
  background: #faf7f4;
  color: #38291f;
}

.board-header {
  flex: none;
  border-bottom: 1px solid #e9ded5;
  background: #fffdfb;
}

.board-inner {
  box-sizing: border-box;
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
  padding: 14px 16px;
}

.status-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.status-row {
  margin-top: 12px;
}

.board-button {
  box-sizing: border-box;
  margin: 0;
  padding: 6px 10px;
  border: 1px solid #e2d4c8;
  border-radius: 8px;
  background: #fff;
  color: #604631;
  font-size: 13px;
  line-height: 1.5;
  white-space: normal;
}

.board-button::after {
  border: 0;
}

.state--occupied {
  --state-ink: #74482e;
  --state-fill: #f8ede2;
  --state-border: #d8b89e;
}

.state--full {
  --state-ink: #8d3025;
  --state-fill: #fce9e3;
  --state-border: #e4a298;
}
.state--vacant {
  --state-ink: #265b41;
  --state-fill: #eaf4ec;
  --state-border: #add0b7;
}

.status-filter,
.table-status {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--state-ink);
}

.status-filter {
  border-color: var(--state-border);
  background: var(--state-fill);
}
.status-filter--selected {
  outline: 2px solid var(--state-ink);
  outline-offset: -2px;
}
.status-dot {
  width: 7px;
  height: 7px;
  flex: none;
  border-radius: 50%;
  background: currentColor;
}
.state-count {
  font-variant-numeric: tabular-nums;
  font-weight: 700;
}

.board-scroll {
  flex: 1;
  height: 0;
  min-height: 0;
}
.board-content {
  padding-bottom: calc(24px + env(safe-area-inset-bottom));
}
.board-error {
  margin-top: 10px;
  color: #8d3025;
  font-size: 13px;
  line-height: 1.5;
}
.board-message {
  padding: 24px 0;
  color: #604631;
  text-align: center;
  font-size: 14px;
}
.table-group + .table-group {
  margin-top: 22px;
}
.group-title {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 10px;
  font-size: 16px;
  font-weight: 650;
}
.group-count {
  color: #6b503c;
  font-size: 12px;
  font-weight: 400;
}
.table-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.table-card {
  min-width: 0;
  padding: 11px 14px;
  border: 1px solid var(--state-border);
  border-left: 4px solid var(--state-ink);
  border-radius: 10px;
  background: var(--state-fill);
}

.table-number {
  display: block;
  color: #38291f;
  font-family: ui-monospace, Consolas, monospace;
  font-size: 23px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1.25;
  overflow-wrap: anywhere;
}

.table-status {
  margin-top: 5px;
  font-size: 14px;
  font-weight: 650;
  line-height: 1.5;
}

.seat-counts {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 12px;
  margin-top: 9px;
  color: #604631;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}

.seat-positions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.seat-label {
  min-width: 24px;
  box-sizing: border-box;
  padding: 2px 4px;
  border: 1px solid var(--state-ink);
  border-radius: 5px;
  color: var(--state-ink);
  text-align: center;
  font-size: 12px;
  font-weight: 650;
}

.seat-label--occupied {
  background: var(--state-ink);
  color: #fff;
}

.seat-legend {
  color: #6b503c;
  font-size: 12px;
  margin-bottom: 12px;
}

@media (min-width: 640px) {
  .table-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>
