import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Shield,
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  Search,
  Clock,
} from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

const DOC_GROUPS = [
  {
    id: "getting-started",
    title: "Getting Started",
    sectionIds: [
      "purchasing-beamng-drive",
      "updating-the-game",
      "beginners-guide",
      "user-interface",
      "replay",
    ],
  },
  {
    id: "gameplay-systems",
    title: "Gameplay Systems",
    sectionIds: [
      "dispatch-callouts",
      "backup-and-units",
      "pursuit-management",
      "traffic-stops",
    ],
  },
  {
    id: "multiplayer-and-setup",
    title: "Multiplayer & Setup",
    sectionIds: ["beammp-multiplayer", "configuration-keybinds"],
  },
  {
    id: "plugin-development",
    title: "Plugin Development",
    sectionIds: [
      "installing-plugins",
      "creating-plugins",
      "plugin-api",
      "plugin-notifications",
      "plugin-troubleshooting",
    ],
  },
];

const DOC_SECTIONS = [
  {
    id: "purchasing-beamng-drive",
    title: "Purchasing BeamNG.drive",
    groupId: "getting-started",
    content: `## Purchasing BeamNG.drive

BeamPD: Response requires a legal copy of BeamNG.drive.

### Where to Buy
1. Open Steam and search for \`BeamNG.drive\`.
2. Purchase and install the game.
3. Launch it once before installing BeamPD.

### Recommended Baseline
- BeamNG.drive current public release
- 16 GB RAM or higher
- SSD storage for faster mod loading
`,
  },
  {
    id: "updating-the-game",
    title: "Updating the game",
    groupId: "getting-started",
    content: `## Updating the game

### Steam Update Check
1. Open Steam Library.
2. Right-click BeamNG.drive -> \`Properties\`.
3. In \`Updates\`, keep automatic updates enabled.
4. Restart Steam if a pending update is stuck.

### Why This Matters
BeamPD hooks into gameplay systems that change between BeamNG versions. Running old builds can break callouts, UI bindings, or plugin behavior.
`,
  },
  {
    id: "beginners-guide",
    title: "Beginner's Guide",
    groupId: "getting-started",
    content: `## Beginner's Guide

### First Session Checklist
1. Install BeamPD and verify the mod is enabled in Mod Manager.
2. Load into a supported map.
3. Wait for dispatch to begin rotating calls.
4. Use your dispatch accept key (default \`Y\`) to take a call.
5. Use backup menu key (default \`B\`) when needed.

### Suggested First Workflow
- Accept a basic dispatch.
- Drive to waypoint.
- Test backup options.
- End the callout and confirm dispatch resumes.
`,
  },
  {
    id: "user-interface",
    title: "User Interface",
    groupId: "getting-started",
    content: `## User Interface

BeamPD ships a backup app at:

\`ui/modules/apps/BeamPDBackup/\`

### What It Shows
- Available support units (Police, SWAT, Tow, Ambulance)
- Current selection
- Pursuit mode restrictions
- Live keybind hints

### Core UI Events Used By BeamPD
- \`BeamPD_BackupVisible\`
- \`BeamPD_BackupSelection\`
- \`BeamPD_BackupOptions\`
- \`BeamPD_BackupMode\`
- \`BeamPD_Keybinds\`

The app also triggers a ready handshake with:
\`BeamPD_main.BeamPD_uiReady()\` (or falls back to \`extensions.hook('BeamPD_uiReady')\`).
`,
  },
  {
    id: "replay",
    title: "Replay",
    groupId: "getting-started",
    content: `## Replay

### Quick Workflow
1. Run your callout session.
2. Save replay from BeamNG's replay system.
3. Review pursuit tactics, stopping distance, and route choices.

### Why Replay Helps
It is the fastest way to debug your own driving line, interception timing, and scene safety.
`,
  },
  {
    id: "dispatch-callouts",
    title: "Dispatch Callouts",
    groupId: "gameplay-systems",
    content: `## Dispatch Callouts

BeamPD rotates dynamic callouts on a timer and can blend built-in plus plugin-provided callouts.

### Built-in Types (examples)
- Pursuit — A suspect in an ETK 800 attempts to flee. Stop them before they escape.
- Suspicious Vehicle — Investigate a parked pickup truck behaving suspiciously.
- Traffic Stop — Approach and secure a Bastion travelling in normal traffic.
- Accident — Arrive on scene and assess a two-vehicle crash.
- Disturbance — Stabilize a scene involving two stopped civilians.
- Reckless Driving — Chase down a Sunburst driving dangerously.
- Hit and Run — Locate and stop a fleeing suspect before they disappear.
- Stolen Vehicle Pursuit — Intercept a stolen vehicle making a run for it.
- Van Robbery — Stop a robbery van fleeing the scene at high speed.
- Street Racing Bust — Break up a street race and stop the lead suspect.
- Wrong-Way Driver — Intercept a vehicle driving the wrong way before a collision.
- Runaway Truck Roadblock — Hold a roadblock and stop an incoming truck.
- DUI Checkpoint — Assist checkpoint units and pursue a vehicle that blew through.
- Vehicle Fire — Secure the scene and request a tow for a burning vehicle.
- Disabled Vehicle — Call tow services and recover a broken-down car.
- Medical Escort — Escort an ambulance safely to its emergency destination.

### Accepting a Callout
- When a callout is offered, a notification appears with the callout name and location.
- Press your accept key (default \`Y\`) to take the call.
- The callout will then appear on your HUD/map with a waypoint.
`,
  },
  {
    id: "backup-and-units",
    title: "Backup & Units",
    groupId: "gameplay-systems",
    content: `## Backup & Units

### Unit Types
- Police Backup
- SWAT Team
- Tow Service
- Ambulance

### Key Behavior
- Backup units follow realistic approach routes.
- They will park behind your vehicle and assist with the scene.
- Units are dismissed automatically once the scene is resolved — no manual action needed.
`,
  },
  {
    id: "pursuit-management",
    title: "Pursuit Management",
    groupId: "gameplay-systems",
    content: `## Pursuit Management

High-speed pursuits are a core part of BeamPD: Response. Suspects will attempt to evade you using dynamic AI routing.

### Starting a Pursuit
A pursuit starts automatically when a suspect accelerates away during a callout.

### Pursuit Tools
- Spike Strips — Coming soon.
- Roadblock — Coming soon.
- PIT Maneuver — Perform a precision immobilization technique at your own risk.

### How Pursuit Ends
- Arrest, release, evade, destroyed target, or explicit callout end.
`,
  },
  {
    id: "traffic-stops",
    title: "Traffic Stops",
    groupId: "gameplay-systems",
    comingSoon: true,
    content: `## Traffic Stops

This section is being expanded with full stop procedure examples and plugin extension points.
`,
  },
  {
    id: "beammp-multiplayer",
    title: "BeamMP Multiplayer",
    groupId: "multiplayer-and-setup",
    content: `## BeamMP Multiplayer

### Basic Setup
1. Place BeamPD assets in your BeamMP client/server mod flow.
2. Ensure every player has matching mod versions.
3. Start the server and verify all clients load BeamPD without errors.

### Notes
- AI backup is still available.
- Coordinate accepted calls among officers to avoid duplication.
`,
  },
  {
    id: "configuration-keybinds",
    title: "Configuration & Keybinds",
    groupId: "multiplayer-and-setup",
    content: `## Configuration & Keybinds

### Main Config
\`lua/ge/extensions/BeamPD/config.lua\`

Important keys include:
- \`DispatchIntervalSeconds\`
- \`CallPendingTimeoutSeconds\`
- \`CallRetryAfterMissSeconds\`
- \`DispatchNearbyLocationPool\`
- \`AcceptedBannerSeconds\`

### Default Keybind Map
\`settings/inputmaps/keyboard_beampd.json\`

Defaults:
- \`beampd_accept_dispatch_call\` -> \`Y\`
- \`beampd_toggle_backup_menu\` -> \`B\`
- \`beampd_backup_up\` -> \`UP\`
- \`beampd_backup_down\` -> \`DOWN\`
- \`beampd_backup_select\` -> \`ENTER\`

You can rebind these in BeamNG Controls under BeamPD actions.
`,
  },
  {
    id: "installing-plugins",
    title: "Installing Plugins",
    groupId: "plugin-development",
    content: `## Installing Plugins

BeamPD scans:
\`BeamPD_Response.zip/plugins/\`

### Install Steps
1. Open \`BeamPD_Response.zip\` in your mod folder.
2. Put plugin \`.lua\` files into \`plugins/\`.
3. Save archive and reload BeamNG.

### Loader Rules
- Only \`.lua\` files are loaded.
- \`__.lua\` and \`initializer.lua\` are ignored.
- Keep plugin file names unique.
`,
  },
  {
    id: "creating-plugins",
    title: "Creating Plugins",
    groupId: "plugin-development",
    content: `## Creating Plugins

A plugin is a Lua file that returns a table.

### Minimum Plugin
~~~lua
local plugin = {
  name = "My First Plugin"
}

return plugin
~~~

### Callout + Hook Example
~~~lua
local plugin = {
  name = "Downtown Alert",

  callouts = {
    {
      id = "downtown_alert",
      message = "Suspicious activity near %s",
      location = {
        name = "Downtown Parking",
        pos = { x = -725.0, y = 82.0, z = 119.0 }
      },
      routePos = { x = -725.0, y = 82.0, z = 119.0 },

      onDispatchCreated = function(self, activeCall, api) end,
      onAccept = function(self, activeCall, api) end,
      onUpdate = function(self, dtReal, dtSim, dtRaw, activeCall, api) end,
      onEnd = function(self, reason, activeCall, api) end
    }
  },

  hooks = {
    onCallAccepted = function(activeCall, api) end
  },

  onLoad = function(self, api, context) end
}

return plugin
~~~

### Important
- Use unique callout IDs.
- Validate location coordinates.
- Build incrementally and test one plugin at a time.
`,
  },
  {
    id: "plugin-api",
    title: "Plugin API",
    groupId: "plugin-development",
    content: `## Plugin API

### Supported Plugin Keys
| Key | Type | Purpose |
|---|---|---|
| name | string | Display/debug plugin name |
| vehicles | table[] | Register extra vehicles |
| maps | table[] | Add map locations |
| callouts | table[] | Add advanced callouts |
| hooks | table | Event callbacks by event name |
| register | function | Optional custom registration |
| scripts | function[] | Setup callbacks |
| onLoad | function | Runs after registration |
| onKeyPressed | function | Key event callback |
| onUIEvent | function | UI event callback |

### Hook Events
- \`onDispatchCreated(activeCall, api)\`
- \`onCallAccepted(currentCallout, api)\`
- \`onCalloutUpdate(dtReal, dtSim, dtRaw, currentCallout, api)\`
- \`onCallEnded(reason, endedCall, api)\`
- \`onTowEvent(payload, api)\`
- \`onKeyPressed(key, api)\`
- \`onUIEvent(eventName, data, api)\`

### Useful API Methods
- \`api.hook(eventName, callback)\`
- \`api.addVehicle(def)\`
- \`api.addMap(name, mapPath, locations)\`
- \`api.addAdvancedCallout(callout)\`
- \`api.getPlayerVehicle()\`
- \`api.getDistanceToPlayer(vehicleOrId)\`
- \`api.spawnVehicle(model, position, options)\`
- \`api.deleteVehicle(vehicleOrId)\`
- \`api.setPursuit(vehicleOrId, shouldFlee)\`
- \`api.endCallout(reason)\`
`,
  },
  {
    id: "plugin-notifications",
    title: "Showing Notifications",
    groupId: "plugin-development",
    content: `## Showing Notifications

BeamPD and backup scripts use BeamNG UI toasts via \`toastrMsg\`.

### Basic Toast Helper
~~~lua
local function notify(kind, title, message, timeoutMs)
  if guihooks and guihooks.trigger then
    guihooks.trigger("toastrMsg", {
      type = kind or "info",      -- info | success | warning | error
      title = title or "BeamPD",
      msg = message or "",
      timeOut = timeoutMs or 3500
    })
  end
end
~~~

### Example Usage In A Plugin Hook
~~~lua
hooks = {
  onCallAccepted = function(activeCall, api)
    notify("success", "My Plugin", "Call accepted: " .. tostring(activeCall.name), 3000)
  end
}
~~~

### Event Types Commonly Used
- \`info\`: general updates
- \`success\`: completed action
- \`warning\`: recoverable issue
- \`error\`: failure condition

### UI Event Notes
- Core BeamPD emits events like \`BeamPD_BackupVisible\`, \`BeamPD_BackupSelection\`, \`BeamPD_BackupOptions\`, and \`BeamPD_Keybinds\`.
- Custom plugin UIs can listen to those events or define their own event names.
`,
  },
  {
    id: "plugin-troubleshooting",
    title: "Plugin Troubleshooting",
    groupId: "plugin-development",
    content: `## Plugin Troubleshooting

### Plugin Does Not Load
1. Confirm file is in \`BeamPD_Response.zip/plugins/\`.
2. Confirm extension is \`.lua\`.
3. Confirm your file returns a table.
4. Confirm filename is not \`__.lua\` or \`initializer.lua\`.

### Callout Does Not Appear
- Confirm valid \`location.name\`.
- Confirm numeric \`location.pos\`.
- Confirm a unique \`id\`.
- Remember callout selection is probabilistic.

### Runtime Errors
- Check BeamNG console logs for plugin load/register/hook errors.
- Isolate by disabling all but one plugin.
`,
  },
];

const mdComponents = {
  h2: ({ children }) => (
    <h2 className="font-heading text-4xl font-bold text-foreground mt-0 mb-4 pb-3 border-b border-border">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="font-heading text-xl font-semibold text-foreground mt-8 mb-3">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="font-body text-muted-foreground leading-relaxed mb-4">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-inside space-y-2 mb-4 ml-1">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside space-y-2 mb-4 ml-1">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="font-body text-muted-foreground leading-relaxed">{children}</li>
  ),
  code: ({ inline, children }) =>
    inline ? (
      <code className="px-1.5 py-0.5 rounded bg-secondary text-primary font-mono text-sm">
        {children}
      </code>
    ) : (
      <pre className="bg-secondary rounded-xl p-4 overflow-x-auto mb-4">
        <code className="text-primary font-mono text-sm">{children}</code>
      </pre>
    ),
  table: ({ children }) => (
    <div className="overflow-x-auto mb-4">
      <table className="w-full text-sm border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead>{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => <tr className="border-b border-border">{children}</tr>,
  th: ({ children }) => (
    <th className="font-heading font-semibold text-foreground text-left py-2 px-3 bg-secondary/50">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="font-body text-muted-foreground py-2 px-3 align-top">{children}</td>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      className="text-primary hover:text-primary/80 underline underline-offset-4"
      target="_blank"
      rel="noreferrer"
    >
      {children}
    </a>
  ),
};

const INITIAL_EXPANDED = DOC_GROUPS.reduce((acc, group, index) => {
  acc[group.id] = index === 0;
  return acc;
}, {});

export default function Docs() {
  const [activeId, setActiveId] = useState(DOC_SECTIONS[0].id);
  const [search, setSearch] = useState("");
  const [expandedGroups, setExpandedGroups] = useState(INITIAL_EXPANDED);

  const sectionMap = useMemo(
    () => new Map(DOC_SECTIONS.map((section) => [section.id, section])),
    []
  );

  const groupedSections = useMemo(
    () =>
      DOC_GROUPS.map((group) => ({
        ...group,
        sections: group.sectionIds
          .map((id) => sectionMap.get(id))
          .filter(Boolean),
      })),
    [sectionMap]
  );

  const query = search.trim().toLowerCase();
  const searchResults = useMemo(() => {
    if (!query) return [];
    return DOC_SECTIONS.filter((section) => {
      const title = section.title.toLowerCase();
      const content = section.content.toLowerCase();
      return title.includes(query) || content.includes(query);
    });
  }, [query]);

  const currentSection = sectionMap.get(activeId) || DOC_SECTIONS[0];

  const toggleGroup = (groupId) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <Shield className="w-7 h-7 text-primary" />
            <span className="font-heading text-xl font-bold tracking-wide text-foreground">
              BeamPD<span className="text-accent">:</span> Response
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/forum"
              className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors"
            >
              Forum
            </Link>
            <Link
              to="/"
              className="flex items-center gap-2 text-sm font-body text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 pt-24 pb-20 flex flex-col lg:flex-row gap-8">
        <motion.aside
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:w-72 flex-shrink-0"
        >
          <div className="sticky top-24 rounded-2xl bg-card border border-border p-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search docs..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-secondary border border-border text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>

            {query ? (
              <div>
                <p className="text-xs font-body font-semibold uppercase tracking-widest text-muted-foreground mb-3 px-2">
                  Search Results
                </p>
                <nav className="flex flex-col gap-0.5">
                  {searchResults.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => {
                        setActiveId(section.id);
                        setSearch("");
                      }}
                      className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-body text-left transition-all ${
                        activeId === section.id
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                      }`}
                    >
                      <span className="truncate">{section.title}</span>
                      {activeId === section.id && (
                        <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                  {searchResults.length === 0 && (
                    <p className="text-xs font-body text-muted-foreground px-3 py-2">
                      No results found.
                    </p>
                  )}
                </nav>
              </div>
            ) : (
              <nav className="flex flex-col gap-1">
                {groupedSections.map((group) => (
                  <div key={group.id} className="rounded-xl">
                    <button
                      onClick={() => toggleGroup(group.id)}
                      className="w-full px-2 py-2 flex items-center gap-2 text-sm font-body font-medium text-foreground hover:text-primary transition-colors"
                    >
                      {expandedGroups[group.id] ? (
                        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                      <span>{group.title}</span>
                    </button>

                    {expandedGroups[group.id] && (
                      <div className="ml-2 border-l border-border pl-2 mt-0.5 mb-1">
                        {group.sections.map((section) => (
                          <button
                            key={section.id}
                            onClick={() => setActiveId(section.id)}
                            className={`flex items-center justify-between w-full px-2 py-1.5 rounded-lg text-sm font-body text-left transition-all ${
                              activeId === section.id
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-muted-foreground hover:text-foreground hover:bg-secondary/70"
                            }`}
                          >
                            <span className="truncate">{section.title}</span>
                            <div className="flex items-center gap-1">
                              {section.comingSoon && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 font-body leading-none">
                                  soon
                                </span>
                              )}
                              {activeId === section.id && (
                                <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            )}
          </div>
        </motion.aside>

        <motion.main
          key={currentSection.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex-1 min-w-0"
        >
          {currentSection.comingSoon ? (
            <div className="rounded-2xl bg-card border border-border p-8 md:p-10 flex flex-col items-center justify-center gap-4 py-24">
              <div className="w-16 h-16 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                <Clock className="w-8 h-8 text-yellow-400" />
              </div>
              <h2 className="font-heading text-3xl font-bold text-foreground">
                {currentSection.title}
              </h2>
              <p className="font-body text-muted-foreground text-center max-w-sm">
                This section is coming soon. Check back later for full documentation.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl bg-card border border-border p-8 md:p-10">
              <ReactMarkdown components={mdComponents}>
                {currentSection.content}
              </ReactMarkdown>
            </div>
          )}
        </motion.main>
      </div>
    </div>
  );
}
