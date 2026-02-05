import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@pages/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@pages/components/ui/tabs"

const CustomeTab=() => {
  return (
    <Tabs defaultValue="overview" className="mr-2">
      <TabsList>
        <TabsTrigger value="overview">Center User</TabsTrigger>
        <TabsTrigger value="analytics">Employee</TabsTrigger>
      </TabsList>
      {/* <TabsContent value="overview">
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>
              View your key metrics and recent project activity. Track progress
              across all your active projects.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            You have 12 active projects and 3 pending tasks.
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="analytics">
        <Card>
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
            <CardDescription>
              Track performance and user engagement metrics. Monitor trends and
              identify growth opportunities.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Page views are up 25% compared to last month.
          </CardContent>
        </Card>
      </TabsContent> */}
    </Tabs>
  )
}

export default CustomeTab