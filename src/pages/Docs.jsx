import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Shield, ArrowLeft, ChevronRight, Search, Clock } from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

const sections = [
  {
    id: "getting-started",
    title: "Getting Started",
    content: `## Getting Started

Welcome to **BeamPD: Response** — the ultimate police roleplay mod for BeamNG.drive.

### Requirements
- BeamNG.drive v0.32 or higher
- A PC capable of running BeamNG.drive at stable framerates

### Installation (Automatic)
1. Download the **Automatic Installer** (.exe) from the Download section.
2. Run the installer — it will auto-detect your BeamNG.drive installation folder.
3. Follow the on-screen prompts to complete installation.
4. Launch BeamNG.drive and enable the mod from the **Mod Manager**.

### Installation (Manual)
1. Download the **Manual Install** (.zip) from the Download section.
2. Navigate to your BeamNG.drive game directory and open the \`mods\` folder.
3. Inside \`mods\`, create a new folder named **BeamPD**.
4. Drop the downloaded \`.zip\` file directly into the **BeamPD** folder — no extraction needed.
5. Launch BeamNG.drive, enable the mod from the **Mod Manager**, and you're good to go.
`,
  },
  {
    id: "callouts",
    title: "Callouts",
    content: `## Callouts

Callouts are dynamic dispatch events that spawn randomly while you patrol. Each callout type has unique behavior and outcomes.

### Built-in Callout Types
- **Pursuit** — A suspect in an ETK 800 attempts to flee. Stop them before they escape.
- **Suspicious Vehicle** — Investigate a parked pickup truck behaving suspiciously.
- **Traffic Stop** — Approach and secure a Bastion travelling in normal traffic.
- **Accident** — Arrive on scene and assess a two-vehicle crash.
- **Disturbance** — Stabilize a scene involving two stopped civilians.
- **Reckless Driving** — Chase down a Sunburst driving dangerously.
- **Hit and Run** — Locate and stop a fleeing suspect before they disappear.
- **Stolen Vehicle Pursuit** — Intercept a stolen vehicle making a run for it.
- **Van Robbery** — Stop a robbery van fleeing the scene at high speed.
- **Street Racing Bust** — Break up a street race and stop the lead suspect.
- **Wrong-Way Driver** — Intercept a vehicle driving the wrong way before a collision.
- **Runaway Truck Roadblock** — Hold a roadblock and stop an incoming truck.
- **DUI Checkpoint** — Assist checkpoint units and pursue a vehicle that blew through.
- **Vehicle Fire** — Secure the scene and request a tow for a burning vehicle.
- **Disabled Vehicle** — Call tow services and recover a broken-down car.
- **Medical Escort** — Escort an ambulance safely to its emergency destination.

### Accepting a Callout
Press the assigned **Dispatch key** (default: \`Y\`) to toggle the dispatch menu. Accept or decline active callouts from the list.

### Callout Frequency
Adjust how often callouts spawn by editing \`lua/ge/extensions/BeamPD/config.lua\` and changing the \`DispatchIntervalSeconds\` value.
`,
  },
  {
    id: "backup",
    title: "Backup & Units",
    content: `## Backup & Units

BeamPD: Response features an AI backup system that lets you request additional officers to your location.

### Requesting Backup
- Press the **Backup key** (default: \`B\`) to open the backup menu.
- Select the number of units (1–4) and their role (patrol, K9, supervisor).
- Units will spawn nearby and drive to your location with lights and sirens.

### Backup Behavior
- Backup units follow realistic approach routes.
- They will park behind your vehicle and assist with the scene.
- Units are dismissed automatically once the scene is resolved — no manual action needed.
`,
  },
  {
    id: "pursuits",
    title: "Pursuit Management",
    content: `## Pursuit Management

High-speed pursuits are a core part of BeamPD: Response. Suspects will attempt to evade you using dynamic AI routing.

### Starting a Pursuit
A pursuit starts automatically when a suspect accelerates away during a callout. There is no manual flag — if they run, the pursuit is on.

### Pursuit Tools
- **Spike Strips** — *Coming soon.*
- **Roadblock** — *Coming soon.*
- **PIT Maneuver** — Perform a precision immobilization technique at your own risk.

### Ending a Pursuit
A pursuit ends when the suspect is stopped or escapes.
`,
  },
  {
    id: "traffic-stops",
    title: "Traffic Stops",
    comingSoon: true,
    content: `## Traffic Stops

Traffic stops allow you to pull over any vehicle and interact with its driver.

### Initiating a Stop
1. Get behind a vehicle and activate your lights (default: \`Shift + N\`).
2. The vehicle will pull over within a few seconds.
3. Exit your vehicle to approach the suspect.

### Stop Actions
- **Run Plates** — Check if the vehicle is stolen or the driver has warrants.
- **Issue Citation** — Give the driver a fine and let them go.
- **Make Arrest** — Detain the driver if they have warrants or contraband.
- **Search Vehicle** — Conduct a vehicle search for contraband.
`,
  },
  {
    id: "beammp",
    title: "BeamMP Multiplayer",
    content: `## BeamMP Multiplayer

BeamPD: Response supports multiplayer patrol sessions via BeamMP.

### Server Setup
1. Place the BeamPD: Response mod files in your BeamMP server's \`Resources/Client\` folder.
2. Ensure all players have the mod installed on their client.
3. Start the server — players can then connect and patrol together.

### Multiplayer Notes
- Callouts are shared across all connected officers.
- Each player controls their own vehicle and equipment.
- Backup requests will summon AI units (player backup coordination is manual).
`,
  },
  {
    id: "installing-plugins",
    title: "Installing Plugins",
    content: `## Installing Plugins

Plugins are community-made add-ons that extend BeamPD: Response with new callouts, vehicles, sounds, and more.

### How to Install a Plugin
1. Download the plugin zip from the Plugins page.
2. Open BeamPD_Response.zip (the main mod archive in your mods folder).
3. Place the plugin .lua script directly into the plugins/ folder inside the zip.
4. Save and close the archive, then launch or reload BeamNG.drive. BeamPD automatically detects and loads all plugin files in that folder.

### Notes
- BeamPD only loads files ending in .lua from plugins/.
- The loader ignores files named __.lua and initializer.lua.
- If Plugins Go Here.txt is still in that folder, you can remove it after installing your first plugin.
- Plugin file names should be unique and easy to identify.
- If a plugin is not loading, double-check it is inside BeamPD_Response.zip/plugins/ and that the mod is enabled in BeamNG.drive Mod Manager.
- Some plugins may require extra dependencies listed by the plugin author.
`,
  },
  {
    id: "creating-plugins",
    title: "Creating Plugins",
    content: `## Creating Plugins

BeamPD plugins are Lua files placed in the plugins/ folder that return a table.

### Minimum Plugin File
~~~lua
local plugin = {
  name = "My First Plugin"
}

return plugin
~~~

### Example Plugin (Callout + Hook)
~~~lua
local plugin = {
  name = "Downtown Alert",

  callouts = {
    {
      id = "downtown_alert",
      message = "Suspicious activity reported near %s",
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

### Load Rules
- Place plugin files inside BeamPD_Response.zip/plugins/.
- Files must end in .lua.
- Files named __.lua or initializer.lua are ignored by the loader.
- Use unique IDs for custom callouts, for example myplugin_bank_robbery.
`,
  },
  {
    id: "plugin-api",
    title: "Plugin API",
    content: `## Plugin API

The following plugin keys are supported by the BeamPD v0.6 loader.

| Key | Type | Purpose |
|---|---|---|
| name | string | Plugin display/debug name |
| vehicles | table[] | Vehicle definitions registered with BeamPD |
| maps | table[] | Map locations merged into dispatch pools |
| callouts | table[] | Advanced callouts injected into dispatch |
| hooks | table | Event callbacks keyed by event name |
| register | function | Custom registration function (optional) |
| scripts | function[] | Additional setup callbacks |
| onLoad | function | Called after plugin registration |
| onKeyPressed | function | Convenience key event callback |
| onUIEvent | function | Convenience UI event callback |

### Hook Events
- onDispatchCreated (activeCall, api)
- onCallAccepted (currentCallout, api)
- onCalloutUpdate (dtReal, dtSim, dtRaw, currentCallout, api)
- onCallEnded (reason, endedCall, api)
- onTowEvent (payload, api)
- onKeyPressed (key, api)
- onUIEvent (eventName, data, api)

### Useful API Methods
- api.hook(eventName, callback)
- api.addVehicle(def)
- api.addMap(name, mapPath, locations)
- api.addAdvancedCallout(callout)
- api.getPlayerVehicle()
- api.getDistanceToPlayer(vehicleOrId)
- api.spawnVehicle(model, position, options)
- api.deleteVehicle(vehicleOrId)
- api.setPursuit(vehicleOrId, shouldFlee)
- api.endCallout(reason)

### Map Location Example
~~~lua
maps = {
  {
    name = "West Coast USA",
    mapPath = "/levels/west_coast_usa/",
    locations = {
      {
        name = "Marina District",
        pos = { x = -910.0, y = 140.0, z = 112.0 },
        area = "city"
      }
    }
  }
}
~~~
`,
  },
  {
    id: "plugin-troubleshooting",
    title: "Plugin Troubleshooting",
    content: `## Plugin Troubleshooting

### Plugin Does Not Load
1. Confirm the file is inside BeamPD_Response.zip/plugins/.
2. Confirm the file extension is .lua.
3. Confirm the file returns a Lua table with return plugin.
4. Confirm the file name is not __.lua or initializer.lua.

### Callout Never Appears
- Verify your callout has a unique id, a valid location.name, and numeric location.pos values.
- BeamPD mixes built-in and plugin callouts, so plugin callouts are probabilistic.

### Runtime Errors
- BeamPD logs plugin failures with messages such as Plugin load failed (...), Plugin register failed (...), and Plugin hook error (...).
- Build plugins incrementally and test one file at a time.
`,
  },
  {
    id: "configuration",
    title: "Configuration",
    content: `## Configuration

BeamPD: Response uses two separate configuration files for different purposes.

### General Config
Controls core gameplay parameters and is located at:

\`lua/ge/extensions/BeamPD/config.lua\`

| Setting | Default | Description |
|---|---|---|
| DispatchIntervalSeconds | 10 | Seconds between dispatched callouts |
| CallCooldown | 10 | Backward-compatible cooldown for older code paths |
| ArrestDistance | 10 | Distance (metres) required to make an arrest |
| AcceptedBannerSeconds | 4 | How long the "call accepted" HUD notification is shown |

Open the file in any text editor and adjust values to your preference. Save and reload the mod for changes to take effect.

### Keybinds
All keybind mappings are stored at:

\`BeamPD/settings/inputmaps/keyboard_beampd.json\`

Edit this file to remap any mod control to a different key.
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
  ul: ({ children }) => <ul className="space-y-2 mb-4 ml-1">{children}</ul>,
  ol: ({ children }) => <ol className="space-y-2 mb-4 ml-1 list-decimal list-inside">{children}</ol>,
  li: ({ children, ordered }) => (
    <li className="font-body text-muted-foreground flex gap-2 items-start">
      {!ordered && <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />}
      <span>{children}</span>
    </li>
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
    <td className="font-body text-muted-foreground py-2 px-3">{children}</td>
  ),
};

export default function Docs() {
  const [active, setActive] = useState(sections[0].id);
  const [search, setSearch] = useState("");
  const current = sections.find((s) => s.id === active);

  const filtered = search.trim()
    ? sections.filter((s) =>
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.content.toLowerCase().includes(search.toLowerCase())
      )
    : sections;

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <Shield className="w-7 h-7 text-primary" />
            <span className="font-heading text-xl font-bold tracking-wide text-foreground">
              BeamPD<span className="text-accent">:</span> Response
            </span>
          </Link>
          <Link to="/" className="flex items-center gap-2 text-sm font-body text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 pt-24 pb-20 flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <motion.aside
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          className="md:w-56 flex-shrink-0"
        >
          <div className="sticky top-24">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search docs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-secondary border border-border text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>

            <p className="text-xs font-body font-semibold uppercase tracking-widest text-muted-foreground mb-3 px-2">Documentation</p>
            <nav className="flex flex-col gap-0.5">
              {filtered.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setActive(s.id); setSearch(""); }}
                  className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-body text-left transition-all ${
                    active === s.id
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  <span>{s.title}</span>
                  <div className="flex items-center gap-1">
                    {s.comingSoon && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 font-body leading-none">soon</span>
                    )}
                    {active === s.id && <ChevronRight className="w-3.5 h-3.5" />}
                  </div>
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="text-xs font-body text-muted-foreground px-3 py-2">No results found.</p>
              )}
            </nav>
          </div>
        </motion.aside>

        {/* Content */}
        <motion.main
          key={active}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex-1 min-w-0"
        >
          {current?.comingSoon ? (
            <div className="rounded-2xl bg-card border border-border p-8 md:p-10 flex flex-col items-center justify-center gap-4 py-24">
              <div className="w-16 h-16 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                <Clock className="w-8 h-8 text-yellow-400" />
              </div>
              <h2 className="font-heading text-3xl font-bold text-foreground">{current.title}</h2>
              <p className="font-body text-muted-foreground text-center max-w-sm">
                This section is coming soon. Check back later for full documentation.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl bg-card border border-border p-8 md:p-10">
              <ReactMarkdown components={mdComponents}>{current?.content}</ReactMarkdown>
            </div>
          )}
        </motion.main>
      </div>
    </div>
  );
}
