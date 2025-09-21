"use client"

import { useState, useEffect } from "react"
import { getSystemSettings, updateSystemSettings, getAllUsers, subscribeToSystemSettings } from "@/lib/database"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Users, Plus, Trash2, Save, Shield, User, Settings } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { SystemSettings, UserData } from "@/lib/database"

export function UserManagement() {
  const [settings, setSettings] = useState<SystemSettings>({
    maxUsers: 5,
    allowedUsers: ["Ahmed", "User1", "User2", "User3", "User4"],
  })
  const [users, setUsers] = useState<UserData[]>([])
  const [newUsername, setNewUsername] = useState("")
  const [newMaxUsers, setNewMaxUsers] = useState(5)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const loadData = async () => {
      const systemSettings = await getSystemSettings()
      setSettings(systemSettings)
      setNewMaxUsers(systemSettings.maxUsers)

      const allUsers = await getAllUsers()
      setUsers(allUsers)
    }

    loadData()

    const unsubscribe = subscribeToSystemSettings((newSettings) => {
      setSettings(newSettings)
      setNewMaxUsers(newSettings.maxUsers)
    })

    return unsubscribe
  }, [])

  const handleAddUser = async () => {
    if (!newUsername.trim()) return

    if (settings.allowedUsers.includes(newUsername)) {
      toast({
        title: "Error",
        description: "User already exists.",
        variant: "destructive",
      })
      return
    }

    if (settings.allowedUsers.length >= settings.maxUsers) {
      toast({
        title: "Error",
        description: `Maximum number of users (${settings.maxUsers}) reached.`,
        variant: "destructive",
      })
      return
    }

    try {
      const updatedSettings = {
        ...settings,
        allowedUsers: [...settings.allowedUsers, newUsername],
      }
      await updateSystemSettings(updatedSettings)
      setNewUsername("")
      setIsAddDialogOpen(false)
      toast({
        title: "User added",
        description: `${newUsername} has been added to the system.`,
      })
    } catch (error) {
      console.error("Error adding user:", error)
      toast({
        title: "Error",
        description: "Failed to add user. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleRemoveUser = async (username: string) => {
    if (username === "Ahmed") {
      toast({
        title: "Error",
        description: "Cannot remove the admin user.",
        variant: "destructive",
      })
      return
    }

    try {
      const updatedSettings = {
        ...settings,
        allowedUsers: settings.allowedUsers.filter((user) => user !== username),
      }
      await updateSystemSettings(updatedSettings)
      toast({
        title: "User removed",
        description: `${username} has been removed from the system.`,
      })
    } catch (error) {
      console.error("Error removing user:", error)
      toast({
        title: "Error",
        description: "Failed to remove user. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateMaxUsers = async () => {
    if (newMaxUsers < settings.allowedUsers.length) {
      toast({
        title: "Error",
        description: `Cannot set max users below current user count (${settings.allowedUsers.length}).`,
        variant: "destructive",
      })
      return
    }

    try {
      const updatedSettings = {
        ...settings,
        maxUsers: newMaxUsers,
      }
      await updateSystemSettings(updatedSettings)
      setIsSettingsDialogOpen(false)
      toast({
        title: "Settings updated",
        description: `Maximum users set to ${newMaxUsers}.`,
      })
    } catch (error) {
      console.error("Error updating settings:", error)
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">User Management</h2>
        <div className="flex space-x-2">
          <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>System Settings</DialogTitle>
                <DialogDescription>Configure system-wide user settings.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="max-users">Maximum Users</Label>
                  <Input
                    id="max-users"
                    type="number"
                    min="1"
                    max="50"
                    value={newMaxUsers}
                    onChange={(e) => setNewMaxUsers(Number.parseInt(e.target.value) || 1)}
                  />
                  <p className="text-sm text-muted-foreground mt-1">Current users: {settings.allowedUsers.length}</p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsSettingsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateMaxUsers}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={settings.allowedUsers.length >= settings.maxUsers}>
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>Add a new user to the system.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="Enter username"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Users: {settings.allowedUsers.length} / {settings.maxUsers}
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddUser} disabled={!newUsername.trim()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Allowed Users ({settings.allowedUsers.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {settings.allowedUsers.map((username) => {
                const userData = users.find((u) => u.username === username)
                const isAdmin = username === "Ahmed"

                return (
                  <div key={username} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        {isAdmin ? (
                          <Shield className="w-4 h-4 text-primary-foreground" />
                        ) : (
                          <User className="w-4 h-4 text-primary-foreground" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{username}</span>
                          {isAdmin && (
                            <Badge variant="secondary" className="text-xs">
                              <Shield className="w-3 h-3 mr-1" />
                              Admin
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {userData?.hasAgreedToRules ? "Rules agreed" : "Rules not agreed"}
                        </p>
                      </div>
                    </div>
                    {!isAdmin && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove User</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove {username} from the system? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleRemoveUser(username)}>Remove</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Total Users:</span>
              <span className="font-medium">{settings.allowedUsers.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Maximum Users:</span>
              <span className="font-medium">{settings.maxUsers}</span>
            </div>
            <div className="flex justify-between">
              <span>Available Slots:</span>
              <span className="font-medium">{settings.maxUsers - settings.allowedUsers.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Users with Rules Agreed:</span>
              <span className="font-medium">{users.filter((u) => u.hasAgreedToRules).length}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
