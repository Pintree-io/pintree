import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
  import { Input } from "@/components/ui/input";
  import { Label } from "@/components/ui/label";

  const SocialMediaCard = ({
    settings,
    handleChange,
  }: {
    settings: any;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }) => {
    const socialLinks = [
      {
        id: "githubUrl",
        label: "GitHub URL",
        placeholder: "https://github.com/yourusername",
      },
      {
        id: "twitterUrl",
        label: "Twitter URL",
        placeholder: "https://twitter.com/yourusername",
      },
      {
        id: "discordUrl",
        label: "Discord URL",
        placeholder: "https://discord.gg/yourserver",
      },
      {
        id: "youtubeUrl",
        label: "YouTube Channel Link",
        placeholder: "https://youtube.com/c/yourchannel",
      },
      { id: "weixinUrl", label: "WeChat Official Account Link", placeholder: "WeChat Official Account Link" },
      {
        id: "weiboUrl",
        label: "Weibo Homepage Link",
        placeholder: "https://weibo.com/yourpage",
      },
      {
        id: "bilibiliUrl",
        label: "Bilibili Homepage Link",
        placeholder: "https://space.bilibili.com/yourpage",
      },
      {
        id: "zhihuUrl",
        label: "Zhihu Homepage Link",
        placeholder: "https://zhihu.com/people/yourpage",
      },
    ];
  
    return (
      <Card className="border bg-white">
        <CardHeader className="border-b">
          <CardTitle>Social Media Links</CardTitle>
          <CardDescription>Set the social media links displayed in the footer of your website</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 p-6">
          {socialLinks.map(({ id, label, placeholder }) => (
            <div key={id} className="grid gap-2">
              <Label htmlFor={id}>{label}</Label>
              <Input
                id={id}
                name={id}
                value={settings[id] || ""}
                onChange={handleChange}
                placeholder={placeholder}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  };

  export default SocialMediaCard;