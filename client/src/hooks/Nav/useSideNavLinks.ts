import { useMemo } from 'react';
import { MCPIcon, AttachmentIcon, OpenAIMinimalIcon } from '@librechat/client';
import {
  Bot,
  Brain,
  Bookmark,
  NotebookPen,
  ScrollText,
  CalendarClock,
  ArrowRightToLine,
  SlidersHorizontal,
} from 'lucide-react';
import {
  Permissions,
  EModelEndpoint,
  PermissionTypes,
  isParamEndpoint,
  isAgentsEndpoint,
  isAssistantsEndpoint,
} from 'librechat-data-provider';
import type { TInterfaceConfig, TEndpointsConfig } from 'librechat-data-provider';
import type { NavLink } from '~/common';
import {
  useAgentCapabilities,
  useMCPServerManager,
  useGetAgentsConfig,
  useHasAccess,
} from '~/hooks';
import Parameters from '~/components/SidePanel/Parameters/Panel';

export default function useSideNavLinks({
  hidePanel,
  keyProvided,
  endpoint,
  endpointType,
  interfaceConfig,
  endpointsConfig,
  includeHidePanel = true,
}: {
  hidePanel?: () => void;
  keyProvided: boolean;
  endpoint?: EModelEndpoint | null;
  endpointType?: EModelEndpoint | null;
  interfaceConfig: Partial<TInterfaceConfig>;
  endpointsConfig: TEndpointsConfig;
  includeHidePanel?: boolean;
}) {
  const hasAccessToPrompts = useHasAccess({
    permissionType: PermissionTypes.PROMPTS,
    permission: Permissions.USE,
  });
  const hasAccessToSkills = useHasAccess({
    permissionType: PermissionTypes.SKILLS,
    permission: Permissions.USE,
  });
  const hasAccessToBookmarks = useHasAccess({
    permissionType: PermissionTypes.BOOKMARKS,
    permission: Permissions.USE,
  });
  const hasAccessToMemories = useHasAccess({
    permissionType: PermissionTypes.MEMORIES,
    permission: Permissions.USE,
  });
  const hasAccessToReadMemories = useHasAccess({
    permissionType: PermissionTypes.MEMORIES,
    permission: Permissions.READ,
  });
  const hasAccessToAgents = useHasAccess({
    permissionType: PermissionTypes.AGENTS,
    permission: Permissions.USE,
  });
  const hasAccessToCreateAgents = useHasAccess({
    permissionType: PermissionTypes.AGENTS,
    permission: Permissions.CREATE,
  });
  const hasAccessToUseMCPSettings = useHasAccess({
    permissionType: PermissionTypes.MCP_SERVERS,
    permission: Permissions.USE,
  });
  const hasAccessToCreateMCP = useHasAccess({
    permissionType: PermissionTypes.MCP_SERVERS,
    permission: Permissions.CREATE,
  });
  const hasAccessToSchedules = useHasAccess({
    permissionType: PermissionTypes.SCHEDULES,
    permission: Permissions.USE,
  });
  const { availableMCPServers } = useMCPServerManager();

  const { agentsConfig } = useGetAgentsConfig({ endpointsConfig });
  const { skillsEnabled } = useAgentCapabilities(agentsConfig?.capabilities);

  const Links = useMemo(() => {
    const links: NavLink[] = [];

    if (
      interfaceConfig.parameters === true &&
      isParamEndpoint(endpoint ?? '', endpointType ?? '') === true &&
      !isAgentsEndpoint(endpoint) &&
      keyProvided
    ) {
      links.push({
        title: 'com_sidepanel_parameters',
        label: '',
        icon: SlidersHorizontal,
        id: 'parameters',
        Component: Parameters,
      });
    }

    if (includeHidePanel && hidePanel) {
      links.push({
        title: 'com_sidepanel_hide_panel',
        label: '',
        icon: ArrowRightToLine,
        onClick: hidePanel,
        id: 'hide-panel',
      });
    }

    return links;
  }, [
    endpoint,
    endpointsConfig,
    keyProvided,
    hasAccessToAgents,
    hasAccessToCreateAgents,
    hasAccessToPrompts,
    hasAccessToSkills,
    skillsEnabled,
    hasAccessToMemories,
    hasAccessToReadMemories,
    hasAccessToSchedules,
    interfaceConfig.schedules,
    interfaceConfig.parameters,
    endpointType,
    hasAccessToBookmarks,
    availableMCPServers,
    hasAccessToUseMCPSettings,
    hasAccessToCreateMCP,
    includeHidePanel,
    hidePanel,
  ]);

  return Links;
}
