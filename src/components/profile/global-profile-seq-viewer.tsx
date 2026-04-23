import { StorageRounded } from '@mui/icons-material'
import {
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material'
import { useLockFn } from 'ahooks'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { viewProfile } from '@/services/cmds'
import { showNotice } from '@/services/notice-service'

import { GroupsEditorViewer } from './groups-editor-viewer'
import { ProfileBox } from './profile-box'
import { ProxiesEditorViewer } from './proxies-editor-viewer'
import { RulesEditorViewer } from './rules-editor-viewer'

type GlobalSequenceId = 'GlobalProxies' | 'GlobalRules' | 'GlobalGroups'

interface Props {
  id: GlobalSequenceId
  currentProfile?: IProfileItem | null
  onSave?: (prev?: string, curr?: string) => void
}

export const GlobalProfileSeqViewer = (props: Props) => {
  const { id, currentProfile, onSave } = props
  const { t } = useTranslation()
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [position, setPosition] = useState({ left: 0, top: 0 })
  const [editorOpen, setEditorOpen] = useState(false)

  const titleKeys: Record<Props['id'], string> = {
    GlobalProxies: 'profiles.components.more.global.proxies',
    GlobalRules: 'profiles.components.more.global.rules',
    GlobalGroups: 'profiles.components.more.global.groups',
  }

  const chipLabels: Record<Props['id'], string> = {
    GlobalProxies: 'profiles.components.more.chips.proxies',
    GlobalRules: 'profiles.components.more.chips.rules',
    GlobalGroups: 'profiles.components.more.chips.groups',
  }

  const editLabels: Record<Props['id'], string> = {
    GlobalProxies: 'profiles.components.menu.editProxies',
    GlobalRules: 'profiles.components.menu.editRules',
    GlobalGroups: 'profiles.components.menu.editGroups',
  }

  const openEditor = () => {
    setAnchorEl(null)
    setEditorOpen(true)
  }

  const onOpenFile = useLockFn(async () => {
    setAnchorEl(null)
    try {
      await viewProfile(id)
    } catch (err) {
      showNotice.error(err)
    }
  })

  const itemMenu = [
    { label: editLabels[id], handler: openEditor },
    { label: 'profiles.components.menu.openFile', handler: onOpenFile },
  ]

  const boxStyle = {
    height: 26,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    lineHeight: 1,
  }

  return (
    <>
      <ProfileBox
        onDoubleClick={openEditor}
        onContextMenu={(event) => {
          const { clientX, clientY } = event
          setPosition({ top: clientY, left: clientX })
          setAnchorEl(event.currentTarget as HTMLElement)
          event.preventDefault()
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={0.5}
        >
          <Typography
            width="calc(100% - 52px)"
            variant="h6"
            component="h2"
            noWrap
            title={t(titleKeys[id])}
          >
            {t(titleKeys[id])}
          </Typography>

          <Chip
            label={t(chipLabels[id])}
            color="primary"
            size="small"
            variant="outlined"
            sx={{ height: 20, textTransform: 'capitalize' }}
          />
        </Box>

        <Box sx={boxStyle}>
          <IconButton
            size="small"
            edge="start"
            color="inherit"
            title={t(editLabels[id])}
            onClick={openEditor}
          >
            <StorageRounded fontSize="inherit" />
          </IconButton>
        </Box>
      </ProfileBox>

      <Menu
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorPosition={position}
        anchorReference="anchorPosition"
        transitionDuration={225}
        MenuListProps={{ sx: { py: 0.5 } }}
        onContextMenu={(e) => {
          setAnchorEl(null)
          e.preventDefault()
        }}
      >
        {itemMenu.map((item) => (
          <MenuItem
            key={item.label}
            onClick={item.handler}
            sx={{ minWidth: 120 }}
            dense
          >
            {t(item.label)}
          </MenuItem>
        ))}
      </Menu>

      {editorOpen && id === 'GlobalProxies' && (
        <ProxiesEditorViewer
          profileUid={currentProfile?.uid ?? ''}
          property={id}
          open={true}
          onSave={onSave}
          onClose={() => setEditorOpen(false)}
        />
      )}

      {editorOpen && id === 'GlobalRules' && (
        <RulesEditorViewer
          groupsUid={currentProfile?.option?.groups ?? ''}
          mergeUid={currentProfile?.option?.merge ?? ''}
          profileUid={currentProfile?.uid ?? ''}
          property={id}
          open={true}
          onSave={onSave}
          onClose={() => setEditorOpen(false)}
        />
      )}

      {editorOpen && id === 'GlobalGroups' && (
        <GroupsEditorViewer
          mergeUid={currentProfile?.option?.merge ?? ''}
          proxiesUid={currentProfile?.option?.proxies ?? ''}
          profileUid={currentProfile?.uid ?? ''}
          property={id}
          open={true}
          onSave={onSave}
          onClose={() => setEditorOpen(false)}
        />
      )}
    </>
  )
}
