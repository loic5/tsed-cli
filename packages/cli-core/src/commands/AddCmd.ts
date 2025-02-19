import {Inject} from "@tsed/di";
import {Command} from "../decorators/command";
import {CliDefaultOptions} from "../interfaces/CliDefaultOptions";
import {CommandProvider, QuestionOptions} from "../interfaces/CommandProvider";
import {CliPlugins} from "../services/CliPlugins";
import {ProjectPackageJson} from "../services/ProjectPackageJson";

export interface AddCmdOptions extends CliDefaultOptions {
  name: string;
}

@Command({
  name: "add",
  description: "Add cli plugin to the current project",
  args: {
    name: {
      description: "Npm package name of the cli plugin",
      type: String
    }
  }
})
export class AddCmd implements CommandProvider {
  @Inject(CliPlugins)
  cliPlugins: CliPlugins;

  @Inject(ProjectPackageJson)
  packageJson: ProjectPackageJson;

  $prompt(initialOptions: any): QuestionOptions {
    return [
      {
        type: "autocomplete",
        name: "name",
        message: "Which cli plugin ?",
        default: initialOptions.name,
        when: !initialOptions.name,
        source: async (state: any, keyword: string) => {
          return this.cliPlugins.searchPlugins(keyword);
        }
      }
    ];
  }

  async $exec(ctx: AddCmdOptions) {
    this.packageJson.addDevDependency(ctx.name);

    return [
      {
        title: "Install plugins",
        task: () => this.packageJson.install()
      },
      {
        title: "Load plugins",
        task: () => this.cliPlugins.loadPlugins()
      },
      {
        title: "Install plugins dependencies",
        task: () => {
          this.cliPlugins.addPluginsDependencies();
          return this.packageJson.install();
        }
      }
    ];
  }
}
