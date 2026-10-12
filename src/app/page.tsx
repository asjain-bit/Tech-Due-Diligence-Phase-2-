'use client'

import React, { useState } from 'react'
import { AppShell } from '@/components/templates/AppShell'
import { SiteHeader } from '@/components/organisms/SiteHeader'
import { DataTable } from '@/components/organisms/DataTable'
import { SettingsPanel } from '@/components/organisms/SettingsPanel'
import { KPICard } from '@/components/molecules/KPICard'
import { Toast } from '@/components/molecules/Toast'
import { AppDialog } from '@/components/molecules/AppDialog'
import { Button } from '@/components/atoms/Button'
import { Badge } from '@/components/atoms/Badge'
import { Icon } from '@/components/atoms/Icon'
import type { Column } from '@/components/organisms/DataTable'

interface ClusterMetric extends Record<string, unknown> {
  id: string
  name: string
  region: string
  nodes: number
  status: 'healthy' | 'warning' | 'critical'
  version: string
}

const clusterColumns: Column<ClusterMetric>[] = [
  { key: 'name', header: 'Cluster Name', sortable: true },
  { key: 'region', header: 'Region', sortable: true },
  { key: 'nodes', header: 'Nodes', sortable: true },
  { key: 'version', header: 'K8s Version' },
  {
    key: 'status',
    header: 'Health Status',
    render: (row) => {
      const variant =
        row.status === 'healthy' ? 'success' : row.status === 'warning' ? 'warning' : 'error'
      return (
        <Badge variant={variant} size="sm">
          {row.status.toUpperCase()}
        </Badge>
      )
    },
  },
]

const clusterData: ClusterMetric[] = [
  {
    id: 'c-1',
    name: 'prod-us-east-1a',
    region: 'us-east-1',
    nodes: 64,
    status: 'healthy',
    version: 'v1.31.1',
  },
  {
    id: 'c-2',
    name: 'prod-eu-west-1b',
    region: 'eu-west-1',
    nodes: 48,
    status: 'healthy',
    version: 'v1.31.1',
  },
  {
    id: 'c-3',
    name: 'staging-ap-south-1',
    region: 'ap-south-1',
    nodes: 16,
    status: 'warning',
    version: 'v1.30.4',
  },
  {
    id: 'c-4',
    name: 'canary-us-west-2',
    region: 'us-west-2',
    nodes: 8,
    status: 'healthy',
    version: 'v1.32.0-rc1',
  },
  {
    id: 'c-5',
    name: 'dev-cluster-mesh',
    region: 'us-east-2',
    nodes: 12,
    status: 'critical',
    version: 'v1.29.8',
  },
  {
    id: 'c-6',
    name: 'prod-latam-sa-east',
    region: 'sa-east-1',
    nodes: 24,
    status: 'healthy',
    version: 'v1.31.0',
  },
]

export default function HomePage() {
  const [isLeftbarCollapsed, setIsLeftbarCollapsed] = useState(false)
  const [isRightbarOpen, setIsRightbarOpen] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [showToast, setShowToast] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'settings'>('overview')

  return (
    <AppShell
      isLeftbarCollapsed={isLeftbarCollapsed}
      isRightbarOpen={isRightbarOpen}
      topbar={
        <SiteHeader
          title="TDD Cloud Architecture Console"
          links={[
            { label: 'Overview', href: '#overview', active: activeTab === 'overview' },
            { label: 'Settings', href: '#settings', active: activeTab === 'settings' },
          ]}
          user={{
            name: 'Alex Rivera',
            role: 'Principal SRE',
          }}
        />
      }
      leftbar={
        <div className="flex flex-col h-full justify-between p-2">
          <div className="flex flex-col gap-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-3 w-full p-2 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'bg-bg-selected text-text-accent font-semibold'
                  : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
              }`}
            >
              <Icon name="laptop" size="sm" />
              {!isLeftbarCollapsed && <span>Overview</span>}
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-3 w-full p-2 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'settings'
                  ? 'bg-bg-selected text-text-accent font-semibold'
                  : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
              }`}
            >
              <Icon name="settings" size="sm" />
              {!isLeftbarCollapsed && <span>Settings</span>}
            </button>
          </div>

          <div className="flex flex-col gap-2 pt-2 border-t border-border-default">
            <button
              onClick={() => setIsLeftbarCollapsed(!isLeftbarCollapsed)}
              aria-label={isLeftbarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="flex items-center justify-center p-2 rounded-md text-text-tertiary hover:text-text-primary hover:bg-bg-hover transition-colors"
            >
              <Icon name={isLeftbarCollapsed ? 'chevron-right' : 'chevron-left'} size="sm" />
            </button>
          </div>
        </div>
      }
      main={
        <div className="flex-1 p-6 md:p-8 flex flex-col gap-6 max-w-7xl mx-auto w-full">
          {/* Header banner */}
          <div className="flex items-start justify-between flex-wrap gap-4 pb-2 border-b border-border-default">
            <div>
              <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-text-primary">
                Production Infrastructure Overview
              </h1>
              <p className="text-sm text-text-secondary mt-1">
                Real-time telemetry and cluster fleet management conforming to atomic token
                architecture.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="md"
                onClick={() => setIsRightbarOpen(!isRightbarOpen)}
              >
                {isRightbarOpen ? 'Hide Inspector' : 'Show Inspector'}
              </Button>
              <Button variant="primary" size="md" onClick={() => setIsDialogOpen(true)}>
                New Deployment
              </Button>
            </div>
          </div>

          {/* Toast Notification */}
          {showToast && (
            <Toast
              title="Cluster Sync Completed"
              description="Global multi-region ingress routes successfully reconciled across 6 active zones."
              variant="success"
              onClose={() => setShowToast(false)}
            />
          )}

          {activeTab === 'overview' ? (
            <>
              {/* Metric KPI cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                  title="Total Nodes"
                  value="172"
                  change="+12.5%"
                  trend="up"
                  badgeText="Healthy"
                  description="Auto-scaled across 4 cloud regions"
                />
                <KPICard
                  title="Avg Latency"
                  value="18.4ms"
                  change="-4.2ms"
                  trend="up"
                  badgeText="Optimal"
                  description="Global CDN edge response time"
                />
                <KPICard
                  title="Error Budget"
                  value="99.98%"
                  change="-0.01%"
                  trend="down"
                  badgeText="SLO 99.95%"
                  description="Remaining SLA window: 24 days"
                />
                <KPICard
                  title="Active Workloads"
                  value="1,420"
                  change="Steady"
                  trend="neutral"
                  badgeText="12 Deployments"
                  description="Ingress throughput: 4.2 GB/s"
                />
              </div>

              {/* Data Table */}
              <div className="flex flex-col gap-3">
                <h2 className="text-base font-semibold text-text-primary">
                  Cluster Fleet Inventory
                </h2>
                <DataTable columns={clusterColumns} data={clusterData} pageSize={5} />
              </div>
            </>
          ) : (
            <div className="max-w-3xl">
              <SettingsPanel />
            </div>
          )}

          {/* App Dialog */}
          <AppDialog
            isOpen={isDialogOpen}
            title="Deploy New Container Service"
            description="Provision an isolated container workload with zero downtime canary rollout."
            onClose={() => setIsDialogOpen(false)}
            actions={
              <>
                <Button variant="outline" size="md" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="md" onClick={() => setIsDialogOpen(false)}>
                  Confirm Provisioning
                </Button>
              </>
            }
          >
            <p className="text-sm text-text-secondary leading-relaxed">
              This action will spawn a Kubernetes deployment configuration in the active target
              namespace. Verify resource limits before proceeding.
            </p>
          </AppDialog>
        </div>
      }
      rightbar={
        <div className="p-5 flex flex-col gap-6">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-tertiary">
              Inspector Panel
            </h3>
            <p className="text-xs text-text-secondary mt-1">Active configuration details</p>
          </div>

          <div className="flex flex-col gap-3 p-3 rounded-lg border border-border-default bg-bg-surface-2 text-xs">
            <span className="font-semibold text-text-primary">Target Environment</span>
            <div className="flex justify-between text-text-secondary">
              <span>Cluster:</span>
              <span className="font-mono text-text-primary">prod-us-east-1a</span>
            </div>
            <div className="flex justify-between text-text-secondary">
              <span>Cloud Provider:</span>
              <span className="text-text-primary">AWS EKS</span>
            </div>
            <div className="flex justify-between text-text-secondary">
              <span>Mesh Status:</span>
              <Badge variant="success" size="sm">
                ENVOY v1.30
              </Badge>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-text-primary">Quick Actions</span>
            <Button variant="outline" size="sm" fullWidth>
              View Ingress Logs
            </Button>
            <Button variant="outline" size="sm" fullWidth>
              Drain Canary Pods
            </Button>
            <Button variant="destructive" size="sm" fullWidth>
              Restart Gateway
            </Button>
          </div>
        </div>
      }
    />
  )
}
